'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios').default;
const https = require('https');

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
        this.giraApiClient = null;
        this.uiConfigId = null;

        this.refreshStateTimeout = null;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        if (!this.config.serverIp) {
            this.log.error(`Server IP is empty - please check instance configuration`);
            return;
        }

        if (!this.config.userName || !this.config.userPassword) {
            this.log.error(`User name and/or user password empty - please check instance configuration`);
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
        });

        await this.refreshState();
    }

    async refreshState() {
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
                    }
                }
            }
        } catch (err) {
            // Set device offline
            await this.setApiConnection(false);

            this.log.error(err);
        }

        // Delete old timer
        if (this.refreshStateTimeout) {
            this.clearTimeout(this.refreshStateTimeout);
        }

        this.refreshStateTimeout = this.setTimeout(() => {
            this.refreshStateTimeout = null;
            this.refreshState();
        }, 60 * 1000); // Default 60 sec
        this.log.debug(`refreshStateTimeout: re-created refresh timeout: id ${this.refreshStateTimeout}`);
    }

    async refreshDevices() {
        if (this.apiConnected) {
            const clientToken = await this.getClientToken();

            const uiConfigResponse = await this.giraApiClient.get(`/uiconfig?expand=dataPointFlags,parameters,locations,trades&token=${clientToken}`);
            this.log.debug(`uiConfigResponse ${uiConfigResponse.status}: ${JSON.stringify(uiConfigResponse.data)}`);

            if (uiConfigResponse.status === 200) {
                for (const func of uiConfigResponse.data.functions) {
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
                        await this.setObjectNotExistsAsync(`functions.${func.uid}.${dp.name}`, {
                            type: 'state',
                            common: {
                                name: dp.name,
                                type: 'string',
                                role: 'state',
                                read: dp.canRead,
                                write: dp.canWrite,
                            },
                            native: {
                                uid: dp.uid,
                            },
                        });
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
