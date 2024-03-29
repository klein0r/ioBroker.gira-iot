'use strict';

/**
 * @class
 * @param {object} server http or https node.js object
 * @param {object} webSettings settings of the web server, like <pre><code>{secure: settings.secure, port: settings.port}</code></pre>
 * @param {object} adapter web adapter object
 * @param {object} instanceSettings instance object with common and native
 * @param {object} app express application
 * @return {object} class instance
 */
function GiraWebExtension(server, webSettings, adapter, instanceSettings, app) {
    this.app = app;
    this.adapter = adapter;
    this.settings = webSettings;
    this.config = instanceSettings ? instanceSettings.native : {};
    this.namespace = instanceSettings ? instanceSettings._id.substring('system.adapter.'.length) : 'gira-iot';

    const that = this;

    this.unload = () => {
        return new Promise((resolve) => {
            this.adapter.sendTo(this.namespace, 'unregisterCallbacks');

            this.adapter.log.debug(`${this.namespace} extension unloaded!`);

            // unload app path
            const middlewareIndex = app._router.stack.findIndex((layer) => layer && layer.route === `/${this.namespace}/`);

            if (middlewareIndex !== -1) {
                // Remove the matched middleware
                app._router.stack.splice(middlewareIndex, 1);
            }

            resolve(true);
        });
    };

    // Optional. Say to web instance to wait till this instance is initialized
    // Used if initalisation lasts some time
    this.readyCallback = null;
    this.waitForReady = (cb) => {
        this.readyCallback = cb;
    };

    // {"events":[{"uid":"a01m","value":"0"}],"failures":0,"token":"xxx"}
    this.handleValueRequest = (obj) => {
        if (obj?.events) {
            for (const event of obj.events) {
                this.adapter.sendTo(that.namespace, 'updateValueOf', { uid: event.uid, value: event.value });
            }
        }
    };

    this.handleServiceRequest = (obj) => {
        if (obj?.events) {
            // TODO
        }
    };

    this.registerCallbackUrl = () => {
        let bind = this.adapter.config.bind;

        if (this.config?.webCustomUrlActive && this.config?.webCustomUrl) {
            bind = this.config?.webCustomUrl;
        }

        const callbackBaseUrl = `https://${bind}:${this.settings.port}/${this.namespace}`;
        this.adapter.log.debug(`Setting (new) callback url to ${callbackBaseUrl}`);

        this.adapter.sendTo(that.namespace, 'registerCallbacks', { baseUrl: callbackBaseUrl });
    };

    this.stateChange = (id, state) => {
        if (`${this.namespace}.info.connection` === id && state && state.ack) {
            if (state.val) {
                // gira-iot.x.info.connection changed to true = api connected
                this.registerCallbackUrl();
            }
        }
    };

    // self invoke constructor
    (function __constructor() {
        if (!that.settings.secure) {
            that.adapter.log.error(`Unable to register ${that.namespace} web extension - HTTPS is disabled on web instance`);
        } else if (that.adapter.config.bind === '0.0.0.0') {
            that.adapter.log.error(`Unable to register ${that.namespace} web extension - please select specific interface (other address than 0.0.0.0)`);
        } else {
            that.adapter.log.info(`${that.namespace} server listening on port ${that.settings.port}`);

            if (that.app) {
                that.app.use(`/${that.namespace}/`, (req, res) => {
                    adapter.log.debug(`Received ${req.method} request on ${req.url}`);

                    if (req.method == 'POST') {
                        let body = '';
                        req.on('data', (data) => (body += data));

                        req.on('end', () => {
                            adapter.log.debug(`Received POST data: ${body}`);
                            res.setHeader('Content-Type', 'application/json; charset=utf-8');

                            try {
                                const obj = JSON.parse(body);

                                if (req.url === '/value') {
                                    that.handleValueRequest(obj);

                                    res.status(200).send(JSON.stringify({ status: 'ok' }));
                                } else if (req.url === '/service') {
                                    that.handleServiceRequest(obj);

                                    res.status(200).send(JSON.stringify({ status: 'ok' }));
                                }
                            } catch (err) {
                                that.adapter.log.error(`Unable to parse JSON request: ${err}`);

                                res.status(500).send(JSON.stringify({ status: 'error' }));
                            }
                        });
                    } else {
                        res.status(500).send(JSON.stringify({ status: 'unknown' }));
                    }
                });
            }

            adapter.subscribeForeignStates(`${that.namespace}.info.connection`);

            // Update callback url if instance is already running
            adapter.getForeignState(`${that.namespace}.info.connection`, (err, state) => {
                if (!err && state && state.val) {
                    that.adapter.log.debug(`${that.namespace} already running - sending callback url on startup`);
                    that.registerCallbackUrl();
                }
            });
        }

        // inform web about that all routes are installed
        that.readyCallback && that.readyCallback(that);
    })();
}

module.exports = GiraWebExtension;
