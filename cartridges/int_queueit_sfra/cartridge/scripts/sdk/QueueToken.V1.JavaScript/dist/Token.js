"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgumentException = exports.TokenSerializationException = exports.InvalidHashException = exports.TokenDeserializationException = exports.EnqueueToken = exports.EnqueueTokenGenerator = exports.Token = void 0;
var TokenVersion_1 = require("./model/TokenVersion");
var Payload_1 = require("./Payload");
var EncryptionType_1 = require("./model/EncryptionType");
var QueueITHelpers_1 = require("./QueueITHelpers");
var HeaderDto_1 = require("./model/HeaderDto");
var Base64_1 = require("./helpers/Base64");
var InvalidTokenExceptionMessage = "Invalid token";
var Token = /** @class */ (function () {
    function Token() {
    }
    Token.Enqueue = function (customerId, tokenIdentifierPrefix) {
        return new EnqueueTokenGenerator(customerId, tokenIdentifierPrefix);
    };
    Token.Parse = function (token, secretKey) {
        return EnqueueToken.Parse(token, secretKey);
    };
    return Token;
}());
exports.Token = Token;
var EnqueueTokenGenerator = /** @class */ (function () {
    function EnqueueTokenGenerator(customerId, tokenIdentifier) {
        this._token = new EnqueueToken(customerId, tokenIdentifier);
    }
    EnqueueTokenGenerator.prototype.WithEventId = function (eventId) {
        this._token = EnqueueToken.AddEventId(this._token, eventId);
        return this;
    };
    EnqueueTokenGenerator.prototype.WithValidity = function (validityMillis) {
        var newExpiryTime = this._token.Issued.getTime() + validityMillis;
        this._token = EnqueueToken.AddExpires(this._token, newExpiryTime);
        return this;
    };
    EnqueueTokenGenerator.prototype.WithValidityDate = function (validity) {
        this._token = EnqueueToken.AddExpiresWithDate(this._token, validity);
        return this;
    };
    EnqueueTokenGenerator.prototype.WithPayload = function (payload) {
        this._token = EnqueueToken.AddPayload(this._token, payload);
        return this;
    };
    EnqueueTokenGenerator.prototype.WithIpAddress = function (ip, xForwardedFor) {
        this._token = EnqueueToken.AddIPAddress(this._token, ip, xForwardedFor);
        return this;
    };
    EnqueueTokenGenerator.prototype.Generate = function (secretKey) {
        this._token.Generate(secretKey);
        return this._token;
    };
    return EnqueueTokenGenerator;
}());
exports.EnqueueTokenGenerator = EnqueueTokenGenerator;
var EnqueueToken = /** @class */ (function () {
    function EnqueueToken(customerId, tokenIdentifierPrefix) {
        this.TokenVersion = TokenVersion_1.TokenVersion.QT1;
        this.Encryption = EncryptionType_1.EncryptionType.AES256;
        this._tokenIdentifierPrefix = tokenIdentifierPrefix;
        this.CustomerId = customerId;
        this.Issued = new Date(QueueITHelpers_1.Utils.utcNow());
        this.Expires = QueueITHelpers_1.Utils.maxDate();
        this._tokenIdentifier = EnqueueToken.GetTokenIdentifier(tokenIdentifierPrefix);
    }
    Object.defineProperty(EnqueueToken.prototype, "Payload", {
        get: function () {
            return this._payload;
        },
        set: function (value) {
            this._payload = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnqueueToken.prototype, "Token", {
        get: function () {
            return this.TokenWithoutHash + "." + this.HashCode;
        },
        enumerable: false,
        configurable: true
    });
    ;
    Object.defineProperty(EnqueueToken.prototype, "HashCode", {
        get: function () {
            return this._hashCode;
        },
        set: function (value) {
            this._hashCode = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnqueueToken.prototype, "TokenWithoutHash", {
        get: function () {
            return this._tokenWithoutHash;
        },
        set: function (value) {
            this._tokenWithoutHash = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnqueueToken.prototype, "TokenIdentifier", {
        get: function () {
            return this._tokenIdentifier;
        },
        set: function (value) {
            this._tokenIdentifier = value;
        },
        enumerable: false,
        configurable: true
    });
    EnqueueToken.Create = function (tokenIdentifier, customerId, eventId, issued, expires, ipAddress, xForwardedFor, payload) {
        var token = new EnqueueToken(customerId, "");
        token.TokenIdentifier = tokenIdentifier;
        token.CustomerId = customerId;
        token.EventId = eventId;
        token.Issued = issued;
        token.Expires = expires !== null && expires !== void 0 ? expires : QueueITHelpers_1.Utils.maxDate();
        token.Payload = payload;
        token.IpAddress = ipAddress;
        token.XForwardedFor = xForwardedFor;
        return token;
    };
    EnqueueToken.GetTokenIdentifier = function (tokenIdentifierPrefix) {
        return tokenIdentifierPrefix && tokenIdentifierPrefix.length > 0
            ? "".concat(tokenIdentifierPrefix, "~").concat(QueueITHelpers_1.Utils.generateUUID())
            : QueueITHelpers_1.Utils.generateUUID();
    };
    EnqueueToken.prototype.Generate = function (secretKey, resetTokenIdentifier) {
        if (resetTokenIdentifier === void 0) { resetTokenIdentifier = true; }
        if (resetTokenIdentifier) {
            this.TokenIdentifier = EnqueueToken.GetTokenIdentifier(this._tokenIdentifierPrefix);
        }
        try {
            var utcTimeIssued = this.Issued.getTime();
            var utcTimeExpires = (this.Expires && this.Expires.getTime() == QueueITHelpers_1.Utils.maxDate().getTime()) ? null :
                this.Expires.getTime();
            var dto = new HeaderDto_1.HeaderDto();
            dto.CustomerId = this.CustomerId;
            dto.EventId = this.EventId;
            dto.TokenIdentifier = this.TokenIdentifier;
            dto.Issued = utcTimeIssued;
            dto.Expires = utcTimeExpires;
            dto.Encryption = EncryptionType_1.EncryptionType[EncryptionType_1.EncryptionType.AES256];
            dto.TokenVersion = TokenVersion_1.TokenVersion[TokenVersion_1.TokenVersion.QT1];
            dto.IpAddress = this.IpAddress;
            dto.XForwardedFor = this.XForwardedFor;
            var serialized = dto.Serialize() + ".";
            if (this.Payload) {
                serialized += this.Payload.EncryptAndEncode(secretKey, this.TokenIdentifier);
            }
            this.TokenWithoutHash = serialized;
            var sha256Hash = QueueITHelpers_1.ShaHashing.GenerateHash(secretKey, this.TokenWithoutHash);
            this.HashCode = Base64_1.Base64.encode(sha256Hash);
        }
        catch (ex) {
            throw new TokenSerializationException(ex);
        }
    };
    EnqueueToken.Parse = function (tokenString, secretKey) {
        if (!secretKey || secretKey.length == 0) {
            throw new ArgumentException("Invalid secret key");
        }
        if (!tokenString || tokenString.length == 0) {
            throw new ArgumentException(InvalidTokenExceptionMessage);
        }
        var tokenParts = tokenString.split(".");
        var headerPart = tokenParts[0];
        var payloadPart = tokenParts[1];
        var hashPart = tokenParts[2];
        if (headerPart.length == 0) {
            throw new ArgumentException(InvalidTokenExceptionMessage);
        }
        if (hashPart.length == 0) {
            throw new ArgumentException(InvalidTokenExceptionMessage);
        }
        var token = headerPart + "." + payloadPart;
        var hash = QueueITHelpers_1.ShaHashing.GenerateHash(secretKey, token);
        var expectedHash = Base64_1.Base64.encode(hash);
        if (expectedHash != hashPart) {
            throw new InvalidHashException();
        }
        try {
            var headerModel = HeaderDto_1.HeaderDto.DeserializeHeader(headerPart);
            var payload = void 0;
            if (payloadPart.length > 0) {
                payload = Payload_1.EnqueueTokenPayload.Deserialize(payloadPart, secretKey, headerModel.TokenIdentifier);
            }
            var issuedTime = new Date(headerModel.Issued);
            var expiresDate = headerModel.Expires
                ? (new Date(headerModel.Expires))
                : null;
            var enqueueToken = EnqueueToken.Create(headerModel.TokenIdentifier, headerModel.CustomerId, headerModel.EventId, issuedTime, expiresDate, headerModel.IpAddress, headerModel.XForwardedFor, payload);
            enqueueToken.TokenWithoutHash = token;
            enqueueToken.HashCode = expectedHash;
            return enqueueToken;
        }
        catch (ex) {
            throw new TokenDeserializationException("Unable to deserialize token", ex);
        }
    };
    EnqueueToken.AddIPAddress = function (token, ipAddress, xForwardedFor) {
        return EnqueueToken.Create(token.TokenIdentifier, token.CustomerId, token.EventId, token.Issued, token.Expires, ipAddress, xForwardedFor, token.Payload);
    };
    EnqueueToken.AddEventId = function (token, eventId) {
        return EnqueueToken.Create(token.TokenIdentifier, token.CustomerId, eventId, token.Issued, token.Expires, token.IpAddress, token.XForwardedFor, token.Payload);
    };
    EnqueueToken.AddExpires = function (token, expires) {
        return EnqueueToken.Create(token.TokenIdentifier, token.CustomerId, token.EventId, token.Issued, new Date(expires), token.IpAddress, token.XForwardedFor, token.Payload);
    };
    EnqueueToken.AddExpiresWithDate = function (token, expires) {
        return EnqueueToken.Create(token.TokenIdentifier, token.CustomerId, token.EventId, token.Issued, expires, token.IpAddress, token.XForwardedFor, token.Payload);
    };
    EnqueueToken.AddPayload = function (token, payload) {
        return EnqueueToken.Create(token.TokenIdentifier, token.CustomerId, token.EventId, token.Issued, token.Expires, token.IpAddress, token.XForwardedFor, payload);
    };
    return EnqueueToken;
}());
exports.EnqueueToken = EnqueueToken;
var TokenDeserializationException = /** @class */ (function (_super) {
    __extends(TokenDeserializationException, _super);
    function TokenDeserializationException(message, ex) {
        var _this = _super.call(this, message) || this;
        _this.InternalException = ex;
        return _this;
    }
    return TokenDeserializationException;
}(Error));
exports.TokenDeserializationException = TokenDeserializationException;
var InvalidHashException = /** @class */ (function (_super) {
    __extends(InvalidHashException, _super);
    function InvalidHashException() {
        return _super.call(this, "The token hash is invalid", null) || this;
    }
    return InvalidHashException;
}(TokenDeserializationException));
exports.InvalidHashException = InvalidHashException;
var TokenSerializationException = /** @class */ (function (_super) {
    __extends(TokenSerializationException, _super);
    function TokenSerializationException(ex) {
        var _this = _super.call(this, "Exception serializing token") || this;
        _this.InternalException = ex;
        return _this;
    }
    return TokenSerializationException;
}(Error));
exports.TokenSerializationException = TokenSerializationException;
var ArgumentException = /** @class */ (function (_super) {
    __extends(ArgumentException, _super);
    function ArgumentException(message) {
        return _super.call(this, message) || this;
    }
    return ArgumentException;
}(Error));
exports.ArgumentException = ArgumentException;
