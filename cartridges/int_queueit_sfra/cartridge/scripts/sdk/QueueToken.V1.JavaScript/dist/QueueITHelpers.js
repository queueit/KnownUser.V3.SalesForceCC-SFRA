"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AESEncryption = exports.ShaHashing = exports.Utils = void 0;
var Base64_1 = require("./helpers/Base64");
var Aes_1 = require("./helpers/Aes");
var Md5_1 = require("./helpers/Md5");
var Sha_1 = __importDefault(require("./helpers/Sha"));
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.maxDate = function () {
        return new Date(Date.UTC(9999, 12 - 1, 31, 23, 59, 59, 999));
    };
    Utils.utcNow = function () {
        var now = new Date();
        return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    };
    Utils.padRight = function (str, padding, stringSize) {
        while (str.length < stringSize) {
            str += padding;
        }
        return str;
    };
    // Based on REF 4122 section 4.4 http://www.ietf.org/rfc/rfc4122.txt
    Utils.generateUUID = function () {
        var s = [];
        // eslint-disable-next-line no-secrets/no-secrets
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
    };
    Utils.generateKey = function (value) {
        var utf8Bytes = Aes_1.Utf8Converter.toBytes(value);
        return (0, Sha_1.default)(utf8Bytes);
    };
    Utils.generateIV = function (value) {
        var utf8Bytes = Aes_1.Utf8Converter.toBytes(value);
        var bytes = (0, Md5_1.md5)(utf8Bytes);
        if (bytes.slice) {
            return bytes.slice(0, 16);
        }
        else {
            return new Uint8Array(bytes.buffer.slice(0, 16));
        }
    };
    Utils.uint8ArrayToHexString = function (byteArray) {
        var acc = '';
        for (var i = 0; i < byteArray.length; i++) {
            var val = byteArray[i];
            acc += ('0' + val.toString(16)).slice(-2);
        }
        return acc;
    };
    Utils.uint8ArrayToString = function (array) {
        var out = "", i, len, c;
        var char2, char3;
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += String.fromCharCode(c);
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = array[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    };
    Utils.stringToUint8Array = function (value) {
        var encoded = encodeURIComponent(value);
        var bytes = [];
        var state = 0;
        for (var i = 0; i < encoded.length; i++) {
            switch (state) {
                case 0: //Convert chars to bytes
                    if (encoded[i] == '%') {
                        state = 1;
                    }
                    else {
                        bytes.push(encoded.charCodeAt(i));
                    }
                    break;
                case 1: //Seen '%'
                    state = 2;
                    break;
                case 2: // Seen %H
                    bytes.push(parseInt(encoded.substring(i - 1, i + 1), 16));
                    state = 0;
                    break;
            }
        }
        return new Uint8Array(bytes);
    };
    return Utils;
}());
exports.Utils = Utils;
var ShaHashing = /** @class */ (function () {
    function ShaHashing() {
    }
    ShaHashing.GenerateHash = function (secretKey, tokenString) {
        var content = Aes_1.Utf8Converter.toBytes(tokenString + secretKey);
        return (0, Sha_1.default)(content);
    };
    return ShaHashing;
}());
exports.ShaHashing = ShaHashing;
var AESEncryption = /** @class */ (function () {
    function AESEncryption() {
    }
    AESEncryption.EncryptPayload = function (secretKey, tokenIdentifier, valueToEncrypt) {
        var key = Utils.generateKey(secretKey);
        var iv = Utils.generateIV(tokenIdentifier);
        var aesCBC = new Aes_1.ModeOfOperationCBC(key, iv);
        var encrypted = aesCBC.encrypt(valueToEncrypt);
        return Base64_1.Base64.encode(encrypted);
    };
    AESEncryption.DecryptPayload = function (secretKey, tokenIdentifier, valueToDecrypt) {
        var key = Utils.generateKey(secretKey);
        var iv = Utils.generateIV(tokenIdentifier);
        var aesCBC = new Aes_1.ModeOfOperationCBC(key, iv);
        return aesCBC.decrypt(valueToDecrypt);
    };
    return AESEncryption;
}());
exports.AESEncryption = AESEncryption;
