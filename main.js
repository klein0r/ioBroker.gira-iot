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

        this.giraApiClient = null;

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        if (!this.config.serverIp) {
            this.log.error(`Server IP is empty - please check instance configuration`);
            return;
        }

        this.log.debug(`Current server ip is ${this.config.serverIp}:${this.config.serverPort}`);

        this.giraApiClient = axios.create({
            baseURL: `https://${this.config.serverIp}:${this.config.serverPort}/api/v2/`,
            timeout: 1000,
            responseType: 'json',
            responseEncoding: 'utf8',
            httpsAgent: new https.Agent(
                {
                    rejectUnauthorized: false
                }
            )
        });

        try {
            const deviceInfoResponse = await this.giraApiClient.get('/');
            this.log.debug(`deviceInfoResponse ${JSON.stringify(deviceInfoResponse.status)}: ${JSON.stringify(deviceInfoResponse.data)}`)

            if (deviceInfoResponse.status === 200) {
                const deviceInfo = deviceInfoResponse.data;

                await this.setStateAsync('deviceInfo.name', {val: deviceInfo.deviceName, ack: true});
                await this.setStateAsync('deviceInfo.type', {val: deviceInfo.deviceType, ack: true});
                await this.setStateAsync('deviceInfo.version', {val: deviceInfo.deviceVersion, ack: true});
            }
        } catch (err) {
            this.log.error(err);
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
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