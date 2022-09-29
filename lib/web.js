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
            adapter.log.debug('gira-iot extension unloaded!');

            // unload app path
            const middlewareIndex = app._router.stack.findIndex((layer) => layer && layer.route === `/${that.namespace}/`);

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

    // self invoke constructor
    (function __constructor() {
        const serviceCallbackUri = `/${that.namespace}/service`;
        const valueCallbackUri = `/${that.namespace}/value`;

        if (!that.settings.secure) {
            that.adapter.log.error('Unable to register web extension - HTTPS is disabled on web instance');
        } else {
            that.adapter.log.info(`gira-iot server listening on port ${that.settings.port}: ${serviceCallbackUri} and ${valueCallbackUri}`);

            if (that.app) {
                that.app.use(`/${that.namespace}/`, (req, res) => {
                    adapter.log.debug(`Received request on ${req.url}`);

                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.status(200).send(JSON.stringify({ url: req.url }));
                });
            }
        }

        // inform web about that all routes are installed
        that.readyCallback && that.readyCallback(that);
    })();
}

module.exports = GiraWebExtension;
