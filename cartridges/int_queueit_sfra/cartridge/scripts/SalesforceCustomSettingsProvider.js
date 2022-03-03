'use strict';

/**
 * @typedef {import('./SalesforceContextProvider.js').EnqueueTokenSettings} EnqueueTokenSettings
 * @typedef {import("dw/system/Site")} Site
 */

/**
 * Queue It custom settings provider for Salesforce
 * @param {Site} currentSite The current site
 */
function SalesforceCustomSettingsProvider(currentSite) {

    /** @type {boolean} */
    this.isEnabled = !!currentSite.getCustomPreferenceValue("queueit-enabled");

    /** @type {?string} */
    this.customerId = currentSite.getCustomPreferenceValue("queueit-customerId");

    /** @type {?string} */
    this.secretKey = currentSite.getCustomPreferenceValue("queueit-secretKey");

    /** @type {?string} */
    this.integrationConfigString = currentSite.getCustomPreferenceValue("queueit-integrationsConfigString");

    /** @type {boolean} */
    this.isLoggingEnabled = !!currentSite.getCustomPreferenceValue("queueit-enableLogging");

    /** @type {boolean} */
    this.isEnqueueTokenEnabled = !!currentSite.getCustomPreferenceValue("queueit-enableEnqueueToken");

    /** @type {?EnqueueTokenSettings} */
    this.enqueueTokenSettings = null;

    if (this.isEnqueueTokenEnabled && this.customerId && this.secretKey) {
        this.enqueueTokenSettings = {
            secretKey: this.secretKey,
            customerId: this.customerId,
            validityTime: 60 * 1000
        };
    }
}

module.exports.SalesforceCustomSettingsProvider = SalesforceCustomSettingsProvider;
