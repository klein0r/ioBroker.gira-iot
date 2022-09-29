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

    this.unload = function () {
        return new Promise((resolve) => {
            that.adapter.log.debug('gira-iot extension unloaded!');

            // unload app path
            const middlewareIndex = app._router.stack.findIndex((layer) => layer && layer.route === `/${that.namespace}/`);

            if (middlewareIndex !== -1) {
                // Remove the matched middleware
                app._router.stack.splice(middlewareIndex, 1);
            }

            that.adapter.sendTo(that.namespace, 'unregisterCallbacks');

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
                that.adapter.sendTo(that.namespace, 'updateValueOf', { uid: event.uid, value: event.value });
            }
        }
    };

    this.handleServiceRequest = (obj) => {
        // TODO
    };

    // self invoke constructor
    (function __constructor() {
        if (!that.settings.secure) {
            that.adapter.log.error('Unable to register web extension - HTTPS is disabled on web instance');
        } else {
            that.adapter.log.info(`gira-iot server listening on port ${that.settings.port} - registering callbacks`);

            // TODO: Get current IP of this system
            that.adapter.sendTo(that.namespace, 'registerCallbacks', { baseUrl: `https://172.16.0.160:${that.settings.port}/${that.namespace}` });

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
        }

        // inform web about that all routes are installed
        that.readyCallback && that.readyCallback(that);
    })();
}

module.exports = GiraWebExtension;
