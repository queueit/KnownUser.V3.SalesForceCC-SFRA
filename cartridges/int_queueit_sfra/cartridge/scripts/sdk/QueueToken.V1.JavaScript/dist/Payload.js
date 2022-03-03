"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnqueueTokenPayload = exports.EnqueueTokenPayloadGenerator = exports.Payload = void 0;
var PayloadDto_1 = require("./model/PayloadDto");
var QueueITHelpers_1 = require("./QueueITHelpers");
var Token_1 = require("./Token");
var Base64_1 = require("./helpers/Base64");
var Aes_1 = require("./helpers/Aes");
var Payload = /** @class */ (function () {
    function Payload() {
    }
    Payload.Enqueue = function () {
        return new EnqueueTokenPayloadGenerator();
    };
    return Payload;
}());
exports.Payload = Payload;
var EnqueueTokenPayloadGenerator = /** @class */ (function () {
    function EnqueueTokenPayloadGenerator() {
        this._payload = new EnqueueTokenPayload();
    }
    EnqueueTokenPayloadGenerator.prototype.WithKey = function (key) {
        this._payload = EnqueueTokenPayload.create(this._payload, key);
        return this;
    };
    EnqueueTokenPayloadGenerator.prototype.WithRelativeQuality = function (relativeQuality) {
        this._payload = EnqueueTokenPayload.create(this._payload, null, relativeQuality);
        return this;
    };
    EnqueueTokenPayloadGenerator.prototype.WithCustomData = function (key, value) {
        this._payload = EnqueueTokenPayload.create(this._payload, null);
        this._payload.AddCustomData(key, value);
        return this;
    };
    EnqueueTokenPayloadGenerator.prototype.Generate = function () {
        return this._payload;
    };
    return EnqueueTokenPayloadGenerator;
}());
exports.EnqueueTokenPayloadGenerator = EnqueueTokenPayloadGenerator;
var EnqueueTokenPayload = /** @class */ (function () {
    function EnqueueTokenPayload() {
        this._customData = {};
    }
    Object.defineProperty(EnqueueTokenPayload.prototype, "Key", {
        get: function () {
            return this._key;
        },
        set: function (value) {
            this._key = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnqueueTokenPayload.prototype, "CustomData", {
        get: function () {
            return this._customData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnqueueTokenPayload.prototype, "RelativeQuality", {
        get: function () {
            return this._relativeQuality;
        },
        set: function (value) {
            this._relativeQuality = value;
        },
        enumerable: false,
        configurable: true
    });
    EnqueueTokenPayload.create = function (payload, key, relativeQuality, customData) {
        var newPayload = new EnqueueTokenPayload();
        newPayload.Key = key;
        if (payload) {
            newPayload.RelativeQuality = payload.RelativeQuality;
            newPayload._customData = payload._customData;
            if (!key || key.length == 0) {
                newPayload.Key = payload.Key;
            }
        }
        if (relativeQuality != null) {
            newPayload.RelativeQuality = relativeQuality;
        }
        if (customData) {
            newPayload._customData = customData;
        }
        return newPayload;
    };
    EnqueueTokenPayload.prototype.AddCustomData = function (key, value) {
        if (!this._customData) {
            this._customData = {};
        }
        this._customData[key] = value;
        return this;
    };
    EnqueueTokenPayload.prototype.Serialize = function () {
        var dto = new PayloadDto_1.PayloadDto();
        dto.Key = this.Key;
        dto.RelativeQuality = this.RelativeQuality;
        dto.CustomData = this.CustomData;
        return dto.Serialize();
    };
    EnqueueTokenPayload.Deserialize = function (input, secretKey, tokenIdentifier) {
        var dto = PayloadDto_1.PayloadDto.DeserializePayload(input, secretKey, tokenIdentifier);
        return EnqueueTokenPayload.create(null, dto.Key, dto.RelativeQuality, dto.CustomData);
    };
    EnqueueTokenPayload.prototype.EncryptAndEncode = function (secretKey, tokenIdentifier) {
        try {
            var serializedPayload = this.Serialize();
            var key = QueueITHelpers_1.Utils.generateKey(secretKey);
            var iv = QueueITHelpers_1.Utils.generateIV(tokenIdentifier);
            var aesCBC = new Aes_1.ModeOfOperationCBC(key, iv);
            var encrypted = aesCBC.encrypt(serializedPayload);
            return Base64_1.Base64.encode(encrypted);
        }
        catch (ex) {
            throw new Token_1.TokenSerializationException(ex);
        }
    };
    return EnqueueTokenPayload;
}());
exports.EnqueueTokenPayload = EnqueueTokenPayload;
