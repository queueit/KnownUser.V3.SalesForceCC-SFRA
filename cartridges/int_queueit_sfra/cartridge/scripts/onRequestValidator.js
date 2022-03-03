'use strict';

/**
 * @typedef {import('./SalesforceContextProvider.js').EnqueueTokenSettings} EnqueueTokenSettings
 * @typedef {import("dw/system/Request")} Request
 */

const Site = require("dw/system/Site");
const Response = require('dw/system/Response');
const Logger = require('dw/system/Logger');

const { SalesforceCustomSettingsProvider } = require("./SalesforceCustomSettingsProvider.js");
const { SalesforceContextProvider } = require("./SalesforceContextProvider.js");
const { QueueItLogProvider } = require("./QueueItLogProvider.js");
const { QueueItHelper } = require("./QueueItHelper.js");

const { KnownUser } = require("./sdk/KnownUser.V3.Javascript/dist/index.js");

function handleRequest() {

    try {
        const currentSite = Site.getCurrent();
        const customSettingsProvider = new SalesforceCustomSettingsProvider(currentSite);

        if (!customSettingsProvider.isEnabled) {
            return;
        }

        const queueItLogger = new QueueItLogProvider(currentSite);
        const contextProvider = new SalesforceContextProvider(request, response);

        const enqueueTokenSettings = customSettingsProvider.enqueueTokenSettings;
        if (enqueueTokenSettings !== null) {
            contextProvider.setEnqueueTokenProvider(
                enqueueTokenSettings,
                contextProvider.getHttpRequest().getUserHostAddress(),
                null
            );
        }

        var queueitToken = request.httpParameterMap.get(KnownUser.QueueITTokenKey).stringValue;
        var requestUrl = contextProvider.getHttpRequest().getAbsoluteUri();
        var requestUrlWithoutToken = requestUrl.replace(new RegExp("([\?&])(" + KnownUser.QueueITTokenKey + "=[^&]*)", 'i'), "");
        // The requestUrlWithoutToken is used to match Triggers and as the Target url (where to return the users to).
        // It is therefor important that this is exactly the url of the users browsers. So, if your webserver is
        // behind e.g. a load balancer that modifies the host name or port, reformat requestUrlWithoutToken before proceeding.

        const customerId = customSettingsProvider.customerId;
        const secretKey = customSettingsProvider.secretKey;
        const integrationsConfigString = customSettingsProvider.integrationConfigString;

        var validationResult = KnownUser.validateRequestByIntegrationConfig(
            requestUrlWithoutToken,
            queueitToken,
            integrationsConfigString,
            customerId,
            secretKey,
            contextProvider);

        if (validationResult.doRedirect()) {

            queueItLogger.logEvent('RedirectToQueue', validationResult, queueitToken);

            // Adding no cache headers to prevent browsers to cache requests
            response.setExpires(new Date("Fri, 01 Jan 1990 00:00:00 GMT"))

            if (validationResult.isAjaxResult) {
                // In case of ajax call send the user to the queue by sending a custom queue-it header and redirecting user to queue from javascript
                var prefixedHeaderName = "X-SF-CC-" + validationResult.getAjaxQueueRedirectHeaderKey();

                response.setHttpHeader(prefixedHeaderName, QueueItHelper.addKUPlatformVersion(validationResult.getAjaxRedirectUrl()));
                response.setHttpHeader(Response.ACCESS_CONTROL_EXPOSE_HEADERS, prefixedHeaderName);

                response.setStatus(403); // Forbidden
                return;
            } else {
                // Send the user to the queue - either because hash was missing or because is was invalid
                response.redirect(QueueItHelper.addKUPlatformVersion(validationResult.redirectUrl));
            }
        } else {
            if (requestUrl !== requestUrlWithoutToken && validationResult.actionType === "Queue") {

                queueItLogger.logEvent('RedirectToQueue', validationResult, queueitToken);
                response.redirect(requestUrlWithoutToken);
            }
            queueItLogger.logEvent('Ignore action', validationResult, queueitToken);
            return;
        }
    } catch (e) {
        Logger.error(e.message, e);
    }
}

module.exports = {
    onRequest: handleRequest
}
