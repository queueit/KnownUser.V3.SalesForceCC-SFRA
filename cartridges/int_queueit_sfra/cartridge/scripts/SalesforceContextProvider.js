'use strict';

/**
 * @typedef {import("dw/system/Request")} Request
 * @typedef {import("dw/system/Response")} Response
 */

/**
 * @typedef {Object} EnqueueTokenSettings
 * @property {string} secretKey
 * @property {string} customerId
 * @property {Number} validityTime
 * @property {boolean} isEnqueueTokenKeyEnabled
 */

const Cookie = require("dw/web/Cookie");
const Mac = require('dw/crypto/Mac');
const Encoding = require('dw/crypto/Encoding');

const { Token, Payload } = require("./sdk/QueueToken.V1.JavaScript/dist/index.js");
const { QueueItHelper } = require("./QueueItHelper.js");

/**
 * Salesforce Context Provider Class
 * @param {Request} salesforceNativeRequest
 * @param {Response} salesforceNativeResponse
 */
function SalesforceContextProvider(salesforceNativeRequest, salesforceNativeResponse) {
    var self = this;

    self._httpRequest = new SalesforceHttpRequest(salesforceNativeRequest);
    self._httpResponse = new SalesforceHttpResponse(salesforceNativeResponse);
    self._cryptoProvider = new SalesforceCryptoProvider();
    self._enqueueTokenProvider = null;

    self.getHttpRequest = function() {
        return self._httpRequest;
    }

    self.getHttpResponse = function() {
        return self._httpResponse;
    }

    self.getEnqueueTokenProvider = function() {
        return self._enqueueTokenProvider;
    }

    self.getCryptoProvider = function() {
        return self._cryptoProvider;
    }

    /**
     * Salesforce Enqueue Token Provider Class
     * @param {EnqueueTokenSettings} settings
     * @param {?string} clientIp
     * @param {?any} customData
     */
    self.setEnqueueTokenProvider = function(settings, clientIp, customData) {
        if (!settings || !(settings.validityTime > -1)) {
            self._enqueueTokenProvider = null;
            return;
        }

        self._enqueueTokenProvider = new SalesforceEnqueueTokenProvider(
            settings,
            clientIp,
            customData
        );
    }
}

/**
 * Salesforce Http Request Class
 * @param {Request} salesforceNativeRequest
 */
function SalesforceHttpRequest(salesforceNativeRequest) {
    var self = this;
    self._salesforceNativeRequest = salesforceNativeRequest;

    self.getUserAgent = function() {
        return self._salesforceNativeRequest.getHttpUserAgent();
    }

    self.getHeader = function(name) {
        if(typeof name !== "string") {
            return "";
        }
        var lowerCaseName = name.toLowerCase();

        var headers = self._salesforceNativeRequest.getHttpHeaders();
        var value = headers.get(lowerCaseName);

        if (!value)
            return "";

        return value;
    }

    self.getAbsoluteUri = function() {
        return self._salesforceNativeRequest.getHttpURL().toString();
    }

    self.getUserHostAddress = function() {
        return self._salesforceNativeRequest.getHttpRemoteAddress();
    }

    self.getCookieValue = function(cookieKey) {
        var cookies = self._salesforceNativeRequest.getHttpCookies();

        if (cookies && cookieKey in cookies && cookies[cookieKey]) {
            var cookie = cookies[cookieKey];
            var cookieVal = decodeURIComponent(cookie.value);
            return cookieVal;
        }
        else {
            return "";
        }
    }

    self.getRequestBodyAsString = function() {
        // FRWI: Lets move this to GitHub documentation.
        // ---------------------------------------------
        // getRequestBodyAsString will only be set if request is POST or PUT
        // and is not a form submission (i.e. sent with "application/x-www-form-urlencoded" encoding).
        // For requests where the request body is encoded as query string (above encoding), the url trigger should be used instead.
        var httpParameterMap = self._salesforceNativeRequest
            .getHttpParameterMap();

        var requestBody = httpParameterMap.getRequestBodyAsString();
        if (requestBody) {
            return requestBody;
        }

        var parameterNames = httpParameterMap
            .getParameterNames()
            .toArray();

        if (!parameterNames || parameterNames.length === 0) {
            return "";
        }

        var result = "";
        for (let i = 0; i < parameterNames.length; i++) {
            let parameterName = parameterNames[i];
            let parameterValue = httpParameterMap.get(parameterName);
            let paramValueString = parameterValue.toString();

            result += encodeURIComponent(parameterName) + "=" + encodeURIComponent(paramValueString) + "&";
        }

        return result.substring(0, result.length - 1)
    }
}

/**
 * Salesforce Http Response Class
 * @param {Response} salesforceNativeResponse
 */
function SalesforceHttpResponse(salesforceNativeResponse) {
    var self = this;
    self._salesforceNativeResponse = salesforceNativeResponse;

    self.setCookie = function(cookieName, cookieValue, domain, expiration, isHttpOnly, isSecure) {

        var cookieToAdd = new Cookie(cookieName, encodeURIComponent(cookieValue));
        if (!((domain == null) || (domain == ""))) {
            cookieToAdd.setDomain(domain);
        }
        cookieToAdd.setPath("/");

        var maxAge = expiration == 0 ? expiration : parseInt(expiration) - Math.floor(new Date().getTime() / 1000);
        cookieToAdd.setMaxAge(maxAge);

        // @ts-ignore
        cookieToAdd.setHttpOnly(isHttpOnly)
        cookieToAdd.setSecure(isSecure)

        self._salesforceNativeResponse.addHttpCookie(cookieToAdd);

        return "";
    }
}

/**
 * Salesforce Crypto Provider Class
 */
function SalesforceCryptoProvider() {
    var self = this;

    self.getSha256Hash = function(secretKey, stringToHash) {
        var mac = new Mac(Mac.HMAC_SHA_256);

        const hash = mac.digest(stringToHash, secretKey);
        const hashHex = Encoding.toHex(hash);

        return hashHex;
    }
}

/**
 * Salesforce Enqueue Token Provider Class
 * @param {EnqueueTokenSettings} settings
 * @param {?string} clientIp
 * @param {?any} customData
 */
function SalesforceEnqueueTokenProvider(settings, clientIp, customData) {
    var self = this;
    self._settings = settings;
    self._clientIp = clientIp;

    var customDataObject = {};
    if (customData !== null) {
        customDataObject.cd = customData;
    }

    self._customData = JSON.stringify(customDataObject);

    self.getEnqueueToken = function(waitingRoomId) {
        if (!self._settings || self._settings.validityTime < -1 || !self._clientIp) {
            return null;
        }

        var payload = Payload.Enqueue()
            .WithCustomData(self._customData);

        if(self._settings.isEnqueueTokenKeyEnabled) {
            payload = payload.WithKey(QueueItHelper.generateUUID());
        }

        const token = Token.Enqueue(self._settings.customerId)
            .WithPayload(
                payload.Generate()
            )
            .WithEventId(waitingRoomId)
            .WithIpAddress(self._clientIp)
            .WithValidity(self._settings.validityTime)
            .Generate(self._settings.secretKey);

        return token.Token;
    }
}

module.exports.SalesforceContextProvider = SalesforceContextProvider;
