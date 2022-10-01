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

        this.webHooksBaseUrl = null;
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
        await this.setApiConnection(false);
        await this.setStateAsync('info.callbacksRegistered', { val: false, ack: true });

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

        await this.subscribeStatesAsync('*');
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
                let functionCount = 0;
                let stateCount = 0;
                const keepFunctions = [];
                const allFunctions = (await this.getChannelsOfAsync('functions')).map((obj) => {
                    return this.removeNamespace(obj._id);
                });

                for (const func of uiConfigResponse.data.functions) {
                    keepFunctions.push(`functions.${func.uid}`);

                    this.log.debug(`Found device ${func.uid} with name "${func.displayName}"`);

                    functionCount++;
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

                            const stateObjId = `functions.${func.uid}.${dp.name}`;

                            stateCount++;
                            await this.setObjectNotExistsAsync(stateObjId, {
                                type: 'state',
                                common: giraTypes.channels[func.channelType][dp.name].common,
                                native: {
                                    uid: dp.uid,
                                    parentChannelType: func.channelType,
                                    type: giraTypes.channels[func.channelType][dp.name].type,
                                    mandatory: giraTypes.channels[func.channelType][dp.name].mandatory,
                                    eventing: giraTypes.channels[func.channelType][dp.name].eventing,
                                },
                            });

                            this.uidCache[dp.uid] = `functions.${func.uid}.${dp.name}`;

                            if (giraTypes.channels[func.channelType][dp.name].common.read) {
                                try {
                                    // Try to get current value
                                    const getValueResponse = await this.giraApiClient.get(`/values/${dp.uid}?token=${clientToken}`);
                                    this.log.debug(`getValueResponse ${getValueResponse.status}: ${JSON.stringify(getValueResponse.data)}`);

                                    if (getValueResponse.status === 200) {
                                        for (const value of getValueResponse.data.values) {
                                            const newValue = giraTypes.convertValueForState(
                                                value.value,
                                                giraTypes.channels[func.channelType][dp.name].common.type,
                                                giraTypes.channels[func.channelType][dp.name].type,
                                            );

                                            await this.setStateAsync(stateObjId, { val: newValue, ack: true, c: 'Init value' });
                                        }
                                    }
                                } catch (err) {
                                    this.log.error(`unable to get current value for "${stateObjId}" / "${dp.uid}" - failed with ${err}`);
                                }
                            }
                        }
                    }
                }

                this.log.info(`Updated (or created) ${functionCount} functions with ${stateCount} states`);

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

                this.log.debug(`Creating room "${location.displayName}" with enum id "enum.rooms.${enumId}"`);

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

                this.log.debug(`Creating function "${trade.displayName}" with enum id "enum.functions.${enumId}"`);

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
            const stateObj = await this.getObjectAsync(this.uidCache[uid]);

            // Just update "eventing" states
            if (stateObj?.type === 'state' && stateObj?.native?.eventing) {
                const newValue = giraTypes.convertValueForState(value, stateObj.common.type, stateObj.native.type);

                await this.setStateChangedAsync(this.uidCache[uid], { val: newValue, ack: true, c: 'Value callback' });
            } else {
                this.log.warn(`Received value event for invalid state with "${uid}": ${value}`);
            }
        }
    }

    async registerCallbacks(baseUrl) {
        if (this.apiConnected) {
            if (!this.webHooksRegistered) {
                this.webHooksBaseUrl = baseUrl;

                const serviceCallbackUri = `${this.webHooksBaseUrl}/service`;
                const valueCallbackUri = `${this.webHooksBaseUrl}/value`;

                this.log.debug(`Registering callback urls to ${serviceCallbackUri} and ${valueCallbackUri}`);

                try {
                    const clientToken = await this.getClientToken();
                    const registerCallbacksReponse = await this.giraApiClient.post(`/clients/${clientToken}/callbacks`, {
                        serviceCallback: serviceCallbackUri,
                        valueCallback: valueCallbackUri,
                        testCallbacks: false,
                    });
                    this.log.debug(`registerCallbacksReponse ${registerCallbacksReponse.status}: ${JSON.stringify(registerCallbacksReponse.data)}`);

                    if (registerCallbacksReponse.status == 200) {
                        this.log.info(`Registered callback urls to ${serviceCallbackUri} and ${valueCallbackUri} (web extension)`);

                        this.webHooksRegistered = true;
                        await this.setStateAsync('info.callbacksRegistered', { val: this.webHooksRegistered, ack: true });
                    }
                } catch (err) {
                    this.log.error(`registerCallbacks failed with ${err}`);
                }
            } else {
                this.log.debug(`Unable to register callbacks - webHooksRegistered: ${this.webHooksRegistered}, webHooksBaseUrl: ${this.webHooksBaseUrl}`);
            }
        } else {
            this.log.debug(`Unable to register callbacks - API not connected`);
        }
    }

    async unregisterCallbacks() {
        if (this.apiConnected) {
            if (this.webHooksRegistered) {
                this.log.debug(`Unregister callback urls`);

                try {
                    const clientToken = await this.getClientToken();
                    const unregisterCallbacksReponse = await this.giraApiClient.delete(`/clients/${clientToken}/callbacks`);
                    this.log.debug(`unregisterCallbacksReponse ${unregisterCallbacksReponse.status}: ${JSON.stringify(unregisterCallbacksReponse.data)}`);

                    if (unregisterCallbacksReponse.status === 200) {
                        this.log.info(`Unregistered callback urls to ${this.webHooksBaseUrl} (web extension)`);

                        this.webHooksBaseUrl = null;
                        this.webHooksRegistered = false;
                        await this.setStateAsync('info.callbacksRegistered', { val: this.webHooksRegistered, ack: true, c: this.webHooksBaseUrl });
                    }
                } catch (err) {
                    this.log.error(`unregisterCallbacks failed with ${err}`);
                }
            } else {
                this.log.debug(`Unable to unregister callbacks - webHooksRegistered: ${this.webHooksRegistered}, webHooksBaseUrl: ${this.webHooksBaseUrl}`);
            }
        } else {
            this.log.debug(`Unable to unregister callbacks - API not connected`);
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
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state && !state.ack) {
            const idNoNamespace = this.removeNamespace(id);

            if (idNoNamespace.startsWith('functions.')) {
                this.getObject(id, async (err, stateObj) => {
                    if (err) {
                        this.log.error(`Unable to get object for ${idNoNamespace}: ${err}`);
                    } else if (stateObj?.common?.write) {
                        const uId = stateObj?.native?.uid;
                        const clientToken = await this.getClientToken();

                        if (uId && this.apiConnected && clientToken) {
                            const newValue = giraTypes.convertValueForGira(state.val, stateObj.common.type);

                            try {
                                const putValueResponse = await this.giraApiClient.put(`/values/${uId}?token=${clientToken}`, {
                                    value: newValue,
                                });
                                this.log.debug(`putValueResponse ${putValueResponse.status}: ${JSON.stringify(putValueResponse.data)}`);

                                if (putValueResponse.status === 200) {
                                    // Confirm new value (if sent)
                                    await this.setStateAsync(idNoNamespace, { val: state.val, ack: true });
                                }
                            } catch (err) {
                                this.log.error(`unable to update value of "${idNoNamespace}" / "${uId}" - failed with ${err}`);
                            }
                        }
                    }
                });
            }
        }
    }

    /**
     * @param {ioBroker.Message} obj
     */
    async onMessage(obj) {
        if (obj) {
            this.log.debug(`Received message: ${JSON.stringify(obj.message)}`);

            if (obj.command === 'updateValueOf') {
                this.updateValueOf(obj.message.uid, obj.message.value);
            } else if (obj.command === 'registerCallbacks') {
                const newWebHooksBaseUrl = obj.message.baseUrl;

                if (newWebHooksBaseUrl !== this.webHooksBaseUrl) {
                    this.log.debug(`Received new webHooksBaseUrl: ${newWebHooksBaseUrl} - register callbacks now`);

                    await this.unregisterCallbacks();
                    await this.registerCallbacks(newWebHooksBaseUrl);
                }
            } else if (obj.command === 'unregisterCallbacks') {
                await this.unregisterCallbacks();
            }
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.setApiConnection(false);

            this.unregisterCallbacks();

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
