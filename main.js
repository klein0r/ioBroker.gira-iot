'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios').default;
const https = require('https');
const giraTypes = require(__dirname + '/lib/gira-types');

class GiraIot extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'gira-iot',
        });

        this.apiConnected = false;
        this.webHooksRegistered = false;

        this.giraApiClient = null;
        this.uiConfigId = null;
        this.uidCache = {};

        this.refreshStateTimeout = null;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        if (!this.config.serverIp) {
            this.log.error(`Server IP is empty - please check instance configuration of ${this.namespace}`);
            return;
        }

        if (!this.config.userName || !this.config.userPassword) {
            this.log.error(`User name and/or user password empty - please check instance configuration of ${this.namespace}`);
            return;
        }

        if (!this.config.webInstance) {
            this.log.error(`Web instance is not configured - please check instance configuration of ${this.namespace}`);
            return;
        }

        this.log.info(`Configured server: "${this.config.serverIp}:${this.config.serverPort}" - Connecting with user: "${this.config.userName}"`);
        await this.setStateAsync('info.connection', { val: false, ack: true });

        this.giraApiClient = axios.create({
            baseURL: `https://${this.config.serverIp}:${this.config.serverPort}/api`,
            timeout: 1000,
            responseType: 'json',
            responseEncoding: 'utf8',
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
            validateStatus: (status) => {
                return [200, 201, 401].includes(status);
            },
        });

        await this.refreshState();
    }

    async refreshState() {
        let nextRefreshSec = 60;

        try {
            const deviceInfoResponse = await this.giraApiClient.get('/v2/');
            this.log.debug(`deviceInfoResponse ${deviceInfoResponse.status}: ${JSON.stringify(deviceInfoResponse.data)}`);

            if (deviceInfoResponse.status === 200) {
                const deviceInfo = deviceInfoResponse.data;

                await this.setStateAsync('deviceInfo.name', { val: deviceInfo.deviceName, ack: true });
                await this.setStateAsync('deviceInfo.type', { val: deviceInfo.deviceType, ack: true });
                await this.setStateAsync('deviceInfo.version', { val: deviceInfo.deviceVersion, ack: true });

                let clientToken = await this.getClientToken();

                if (!clientToken) {
                    this.log.info(`Client token doesn't exist - creating a new client`);

                    const clientIdentifier = `net.iobroker.clients.${this.namespace}`;
                    const registerClientResponse = await this.giraApiClient.post(
                        '/clients',
                        {
                            client: clientIdentifier,
                        },
                        {
                            auth: {
                                username: this.config.userName,
                                password: this.config.userPassword,
                            },
                        },
                    );
                    this.log.debug(`registerClientResponse ${registerClientResponse.status}: ${JSON.stringify(registerClientResponse.data)}`);

                    /*
                        201 Created
                        400 Bad Request
                        401 Unauthorized
                        423 Locked
                    */
                    if (registerClientResponse.status === 201) {
                        if (registerClientResponse?.data?.token) {
                            clientToken = registerClientResponse.data.token;

                            await this.setStateAsync('client.identifier', { val: clientIdentifier, ack: true });
                            await this.setStateAsync('client.token', { val: clientToken, ack: true });

                            // Set device online
                            await this.setApiConnection(true);
                        }
                    } else {
                        this.log.error(`Unable to register client. Device responded with code ${registerClientResponse.status}`);

                        await this.setStateAsync('client.identifier', { val: null, ack: true });
                        await this.setStateAsync('client.token', { val: null, ack: true });

                        // Set device offline
                        await this.setApiConnection(false);

                        nextRefreshSec = 60 * 5;
                    }
                } else {
                    // Set device online
                    await this.setApiConnection(true);
                }

                if (this.apiConnected) {
                    const uiConfigIdResponse = await this.giraApiClient.get(`/uiconfig/uid?token=${clientToken}`);
                    this.log.debug(`uiConfigIdResponse ${uiConfigIdResponse.status}: ${JSON.stringify(uiConfigIdResponse.data)}`);

                    if (uiConfigIdResponse.status === 200) {
                        if (uiConfigIdResponse?.data?.uid) {
                            if (uiConfigIdResponse.data.uid !== this.uiConfigId) {
                                this.log.info(`UI config ID changed to ${uiConfigIdResponse.data.uid} - refreshing devices`);

                                await this.refreshDevices();
                                this.uiConfigId = uiConfigIdResponse.data.uid;
                            }
                        }
                    } else if (uiConfigIdResponse.status === 401) {
                        this.log.warn(`Unable to get UI config ID - looks like your client token is invalid. Will be deleted and recreated automatically`);
                        await this.setStateAsync('client.token', { val: null, ack: true });

                        nextRefreshSec = 2; // Call refresh function again to create a new token
                    }
                }
            }
        } catch (err) {
            // Set device offline
            await this.setApiConnection(false);

            if (err.name === 'AxiosError') {
                this.log.error(`Request to ${err?.config?.url} failed with code ${err?.status} (${err?.code}): ${err.message}`);
                this.log.debug(`Complete error object: ${JSON.stringify(err)}`);
            } else {
                this.log.error(err);
            }
        } finally {
            // Delete old timer
            if (this.refreshStateTimeout) {
                this.clearTimeout(this.refreshStateTimeout);
            }

            this.refreshStateTimeout = this.setTimeout(() => {
                this.refreshStateTimeout = null;
                this.refreshState();
            }, nextRefreshSec * 1000);
            this.log.debug(`refreshStateTimeout: re-created refresh timeout: id ${this.refreshStateTimeout}`);
        }
    }

    async refreshDevices() {
        if (this.apiConnected) {
            const clientToken = await this.getClientToken();
            const uiConfigResponse = await this.giraApiClient.get(`/uiconfig?expand=locations,trades&token=${clientToken}`);
            this.log.debug(`uiConfigResponse ${uiConfigResponse.status}: ${JSON.stringify(uiConfigResponse.data)}`);

            if (uiConfigResponse.status === 200) {
                const keepFunctions = [];
                const allFunctions = (await this.getChannelsOfAsync('functions')).map((obj) => {
                    return this.removeNamespace(obj._id);
                });

                for (const func of uiConfigResponse.data.functions) {
                    keepFunctions.push(`functions.${func.uid}`);

                    this.log.debug(`Found device ${func.uid} with name "${func.displayName}"`);

                    await this.setObjectNotExistsAsync(`functions.${func.uid}`, {
                        type: 'channel',
                        common: {
                            name: func.displayName,
                        },
                        native: {
                            uid: func.uid,
                            channelType: func.channelType,
                            functionType: func.functionType,
                        },
                    });

                    for (const dp of func.dataPoints) {
                        if (giraTypes.channels?.[func.channelType]?.[dp.name]) {
                            this.log.debug(`Creating state "functions.${func.uid}.${dp.name}"`);

                            await this.setObjectNotExistsAsync(`functions.${func.uid}.${dp.name}`, {
                                type: 'state',
                                common: giraTypes.channels[func.channelType][dp.name].common,
                                native: {
                                    uid: dp.uid,
                                    mandatory: giraTypes.channels[func.channelType][dp.name].mandatory,
                                    eventing: giraTypes.channels[func.channelType][dp.name].eventing,
                                },
                            });

                            this.uidCache[dp.uid] = `functions.${func.uid}.${dp.name}`;
                        }
                    }
                }

                // Delete non existent functions
                for (let i = 0; i < allFunctions.length; i++) {
                    const id = allFunctions[i];

                    if (keepFunctions.indexOf(id) === -1) {
                        await this.delObjectAsync(id, { recursive: true });
                        this.log.debug(`Function deleted: ${id}`);
                    }
                }

                if (this.config.createRoomsAndFunctions) {
                    if (uiConfigResponse.data?.locations) {
                        await this.createRooms(uiConfigResponse.data.locations);
                    }

                    if (uiConfigResponse.data?.trades) {
                        await this.createFunctions(uiConfigResponse.data.trades);
                    }
                }
            }
        }
    }

    async createRooms(locations) {
        for (const location of locations) {
            if (location?.locationType === 'Room') {
                const enumId = this.cleanNamespace(location.displayName);

                this.log.debug(`Creating room "${location.displayName}" with enum id ${enumId}`);

                await this.setForeignObjectNotExistsAsync(`enum.rooms.${enumId}`, {
                    type: 'enum',
                    common: {
                        name: location.displayName,
                        enabled: true,
                        color: false,
                        members: [],
                    },
                    native: {},
                });

                if (location?.functions) {
                    for (const func of location.functions) {
                        await this.addChannelToEnumAsync('rooms', enumId, 'functions', func);
                    }
                }
            }

            if (location?.locations) {
                await this.createRooms(location.locations);
            }
        }
    }

    async createFunctions(trades) {
        for (const trade of trades) {
            if (trade?.functions && trade.functions.length > 0) {
                const enumId = this.cleanNamespace(trade.tradeType);

                this.log.debug(`Creating function "${trade.displayName}" with enum id ${enumId}`);

                await this.setForeignObjectNotExistsAsync(`enum.functions.${enumId}`, {
                    type: 'enum',
                    common: {
                        name: trade.displayName,
                        enabled: true,
                        color: false,
                        members: [],
                    },
                    native: {},
                });

                for (const func of trade.functions) {
                    await this.addChannelToEnumAsync('functions', enumId, 'functions', func);
                }
            }
        }
    }

    async updateValueOf(uid, value) {
        this.log.debug(`Received update request of "${uid}" with value: ${value}`);

        if (this.uidCache?.[uid]) {
            await this.setStateAsync(this.uidCache[uid], { val: value, ack: true, c: 'Value callback' });
        }
    }

    async registerCallbacks(baseUrl) {
        if (this.apiConnected) {
            if (!this.webHooksRegistered) {
                const serviceCallbackUri = `${baseUrl}/service`;
                const valueCallbackUri = `${baseUrl}/value`;

                this.log.debug(`Registering callback urls to ${serviceCallbackUri} and ${valueCallbackUri}`);

                const clientToken = await this.getClientToken();
                const registerCallbacksReponse = await this.giraApiClient.post(`/clients/${clientToken}/callbacks`, {
                    serviceCallback: serviceCallbackUri,
                    valueCallback: valueCallbackUri,
                    testCallbacks: false,
                });
                this.log.debug(`registerClientsReponse ${registerCallbacksReponse.status}: ${JSON.stringify(registerCallbacksReponse.data)}`);

                if (registerCallbacksReponse.status == 200) {
                    this.log.info(`Registered callback urls to ${serviceCallbackUri} and ${valueCallbackUri}`);
                    this.webHooksRegistered = true;
                }
            }
        } else {
            this.log.error('Unable to register callback urls (API not connected)');
        }
    }

    async unregisterCallbacks() {
        if (this.webHooksRegistered) {
            this.log.debug(`Unregister callback urls`);

            const clientToken = await this.getClientToken();
            this.giraApiClient?.delete(`/clients/${clientToken}/callbacks`);

            this.webHooksRegistered = false;
        }
    }

    async getClientToken() {
        const clientTokenState = await this.getStateAsync('client.token');
        if (clientTokenState && clientTokenState.val) {
            return clientTokenState.val;
        }

        return null;
    }

    async setApiConnection(status) {
        this.apiConnected = status;
        await this.setStateAsync('info.connection', { val: status, ack: true });
    }

    cleanNamespace(id) {
        return id
            .trim()
            .replace(/\s/g, '_') // Replace whitespaces with underscores
            .replace(/[^\p{Ll}\p{Lu}\p{Nd}]+/gu, '_') // Replace not allowed chars with underscore
            .replace(/[_]+$/g, '') // Remove underscores end
            .replace(/^[_]+/g, '') // Remove underscores beginning
            .replace(/_+/g, '_') // Replace multiple underscores with one
            .toLowerCase()
            .replace(/_([a-z])/g, (m, w) => {
                return w.toUpperCase();
            });
    }

    removeNamespace(id) {
        const re = new RegExp(this.namespace + '*\\.', 'g');
        return id.replace(re, '');
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.apiConnected = false;
            this.setStateAsync('info.connection', { val: false, ack: true });

            // Delete old timer
            if (this.refreshStateTimeout) {
                this.log.debug('refreshStateTimeout: UNLOAD');
                this.clearTimeout(this.refreshStateTimeout);
            }

            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * @param {ioBroker.Message} obj
     */
    onMessage(obj) {
        if (obj) {
            this.log.debug(`Received message: ${JSON.stringify(obj.message)}`);

            if (obj.command === 'updateValueOf') {
                this.updateValueOf(obj.message.uid, obj.message.value);
            } else if (obj.command === 'registerCallbacks') {
                this.registerCallbacks(obj.message.baseUrl);
            } else if (obj.command === 'unregisterCallbacks') {
                this.unregisterCallbacks();
            }
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new GiraIot(options);
} else {
    // otherwise start the instance directly
    new GiraIot();
}
