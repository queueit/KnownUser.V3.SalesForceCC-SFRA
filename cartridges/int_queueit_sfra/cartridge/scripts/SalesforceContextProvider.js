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
    this._httpRequest = new SalesforceHttpRequest(salesforceNativeRequest);
    this._httpResponse = new SalesforceHttpResponse(salesforceNativeResponse);
    this._cryptoProvider = new SalesforceCryptoProvider();
    this._enqueueTokenProvider = null;

    this.getHttpRequest = () => {
        return this._httpRequest;
    }

    this.getHttpResponse = () => {
        return this._httpResponse;
    }

    this.getEnqueueTokenProvider = () => {
        return this._enqueueTokenProvider;
    }

    this.getCryptoProvider = () => {
        return this._cryptoProvider;
    }

    /**
     * Salesforce Enqueue Token Provider Class
     * @param {EnqueueTokenSettings} settings
     * @param {?string} clientIp
     * @param {?any} customData
     */
    this.setEnqueueTokenProvider = (settings, clientIp, customData) => {
        if (!settings || !(settings.validityTime > -1)) {
            this._enqueueTokenProvider = null;
            return;
        }

        this._enqueueTokenProvider = new SalesforceEnqueueTokenProvider(
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
    this._salesforceNativeRequest = salesforceNativeRequest;

    this.getUserAgent = () => {
        return this._salesforceNativeRequest.getHttpUserAgent();
    }

    this.getHeader = (name) => {
        if(typeof name !== "string") {
            return "";
        }
        var lowerCaseName = name.toLowerCase();

        var headers = this._salesforceNativeRequest.getHttpHeaders();
        var value = headers.get(lowerCaseName);

        if (!value)
            return "";

        return value;
    }

    this.getAbsoluteUri = () => {
        return this._salesforceNativeRequest.getHttpURL().toString();
    }

    this.getUserHostAddress = () => {
        return this._salesforceNativeRequest.getHttpRemoteAddress();
    }

    this.getCookieValue = (cookieKey) => {
        var cookies = this._salesforceNativeRequest.getHttpCookies();

        if (cookies && cookieKey in cookies) {
            var cookie = cookies[cookieKey];
            var cookieVal = decodeURIComponent(cookie.value);
            return cookieVal;
        }
        else {
            return "";
        }
    }

    this.getRequestBodyAsString = () => {
        // FRWI: Lets move this to GitHub documentation.
        // ---------------------------------------------
        // getRequestBodyAsString will only be set if request is POST or PUT
        // and is not a form submission (i.e. sent with "application/x-www-form-urlencoded" encoding).
        // For requests where the request body is encoded as query string (above encoding), the url trigger should be used instead.
        var httpParameterMap = this._salesforceNativeRequest
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
    this._salesforceNativeResponse = salesforceNativeResponse;

    this.setCookie = (cookieName, cookieValue, domain, expiration, isHttpOnly, isSecure) => {

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

        this._salesforceNativeResponse.addHttpCookie(cookieToAdd);

        return "";
    }
}

/**
 * Salesforce Crypto Provider Class
 */
function SalesforceCryptoProvider() {
    this.getSha256Hash = (secretKey, stringToHash) => {
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
    this._settings = settings;
    this._clientIp = clientIp;

    var customDataObject = {};
    if (customData !== null) {
        customDataObject.cd = customData;
    }

    this._customData = JSON.stringify(customDataObject);

    this.getEnqueueToken = (waitingRoomId) => {
        if (!this._settings || this._settings.validityTime < -1 || !this._clientIp) {
            return null;
        }

        const token = Token.Enqueue(this._settings.customerId)
            .WithPayload(
                Payload.Enqueue()
                    .WithKey(QueueItHelper.generateUUID())
                    .WithCustomData(this._customData)
                    .Generate()
            )
            .WithEventId(waitingRoomId)
            .WithIpAddress(this._clientIp)
            .WithValidity(this._settings.validityTime)
            .Generate(this._settings.secretKey);

        return token.Token;
    }
}

module.exports.SalesforceContextProvider = SalesforceContextProvider;
