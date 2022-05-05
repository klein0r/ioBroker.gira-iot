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

        this.log.debug(`Configured server ip is "${this.config.serverIp}:${this.config.serverPort}" - Connecting with user: "${this.config.userName}"`);
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

        this.refreshState();
    }

    async refreshState() {
        try {
            const deviceInfoResponse = await this.giraApiClient.get('/v2/');
            this.log.debug(`deviceInfoResponse ${JSON.stringify(deviceInfoResponse.status)}: ${JSON.stringify(deviceInfoResponse.data)}`);

            if (deviceInfoResponse.status === 200) {
                // Set device online
                this.apiConnected = true;
                await this.setStateAsync('info.connection', { val: this.apiConnected, ack: true });

                const deviceInfo = deviceInfoResponse.data;

                await this.setStateAsync('deviceInfo.name', { val: deviceInfo.deviceName, ack: true });
                await this.setStateAsync('deviceInfo.type', { val: deviceInfo.deviceType, ack: true });
                await this.setStateAsync('deviceInfo.version', { val: deviceInfo.deviceVersion, ack: true });

                const clientToken = await this.getClientToken();

                if (!clientToken) {
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
                    this.log.debug(`registerClientResponse ${JSON.stringify(registerClientResponse.status)}: ${JSON.stringify(registerClientResponse.data)}`);

                    /*
                        201 Created
                        400 Bad Request
                        401 Unauthorized
                        423 Locked
                    */
                    if (registerClientResponse.status === 201) {
                        if (registerClientResponse.data.token) {
                            await this.setStateAsync('client.identifier', { val: clientIdentifier, ack: true });
                            await this.setStateAsync('client.token', { val: registerClientResponse.data.token, ack: true });
                        }
                    } else {
                        this.log.error(`Unable to register client. Device responded with code ${registerClientResponse.status}`);

                        await this.setStateAsync('client.identifier', { val: null, ack: true });
                        await this.setStateAsync('client.token', { val: null, ack: true });
                    }
                }
            }
        } catch (err) {
            // Set device offline
            this.apiConnected = false;
            await this.setStateAsync('info.connection', { val: this.apiConnected, ack: true });

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

    async getClientToken() {
        const clientTokenState = await this.getStateAsync('client.token');
        if (clientTokenState && clientTokenState.val) {
            return clientTokenState.val;
        }

        throw new Error(`Unable to get client token`);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
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
