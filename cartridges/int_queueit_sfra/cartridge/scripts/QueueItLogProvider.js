'use strict';

/**
 * @typedef {import('./SalesforceContextProvider.js').EnqueueTokenSettings} EnqueueTokenSettings
 * @typedef {import('dw/system/Site')} Site
 */

const Logger = require('dw/system/Logger');
const { SalesforceCustomSettingsProvider } = require('./SalesforceCustomSettingsProvider.js');

/**
 * QueueIT Logging Class
 * @param {Site} currentSite
 */
function QueueItLogProvider(currentSite) {

    const _isLoggingEnabled = new SalesforceCustomSettingsProvider(currentSite).isLoggingEnabled;
    const _logger = Logger.getLogger('QueueIt', 'QueueIt');

    const getCookieInfo = () => {

        // QueueIt cookies begin with hardcoded string: "QueueITAccepted"
        const cookiePrefix = 'QueueITAccepted';
        var cookies = request.getHttpCookies();

        if (!cookies) {
            return [];
        }

        var matchingCookies = [];

        for (var i = 0, len = cookies.cookieCount; i < len; i++) {
            var cookie = cookies[i];
            // if this cookie matches the prefix
            if (cookie.name.substr(0, cookiePrefix.length) === cookiePrefix) {
                matchingCookies.push({
                    name: cookie.name,
                    value: decodeURIComponent(cookie.value)
                });
            }
        }

        return matchingCookies;
    };

    this.logEvent = (eventName, eventDetails, queueItToken) => {

        try {
            // Check if QueueIt logging is enabled.
            if (!_isLoggingEnabled) {
                return;
            }

            var logData = {
                event: eventName,
                time: new Date(),
                ip: request.httpRemoteAddress,
                cookie: getCookieInfo(),
                token: queueItToken,
                details: eventDetails
            };

            _logger.info(JSON.stringify(logData));
        }
        catch (e) {
            Logger.error("Error in writing the queue-it logs:", e);
        }

    };

    /**
     *
     * @param {string} eventName
     * @param {SfraRequest} sfraRequest
     */
    this.logCartEvent = (eventName, sfraRequest) => {

        try {
            // Check if QueueIt logging is enabled.
            if (!_isLoggingEnabled) {
                return;
            }

            if (!sfraRequest.form.pidsObj) {
                var eventData = {};

                var productId = sfraRequest.form.pid || sfraRequest.querystring.pid;
                if (!empty(productId)) {
                    eventData.productId = productId;
                }

                var enteredQuantity = empty(sfraRequest.form.quantity) ?
                    sfraRequest.querystring.quantity :
                    sfraRequest.form.quantity;

                var quantity;
                if (typeof enteredQuantity === 'string' && !empty(enteredQuantity)) {
                    quantity = parseInt(enteredQuantity);
                }

                if (!empty(quantity)) {
                    eventData.quantity = quantity;
                }

                this.logEvent(eventName, eventData);
            } else {
                this.logEvent(eventName, JSON.parse(sfraRequest.form.pidsObj));
            }
        }
        catch (e) {
            Logger.error("Error in writing the cart event logs:", e)
        }

    };
}

module.exports.QueueItLogProvider = QueueItLogProvider;
