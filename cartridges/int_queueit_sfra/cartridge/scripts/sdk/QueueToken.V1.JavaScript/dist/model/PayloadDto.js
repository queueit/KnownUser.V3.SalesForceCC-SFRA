"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadDto = void 0;
var QueueITHelpers_1 = require("../QueueITHelpers");
var Base64_1 = require("../helpers/Base64");
var PayloadDto = /** @class */ (function () {
    function PayloadDto() {
    }
    PayloadDto.prototype.Serialize = function () {
        var obj = {
            r: this.RelativeQuality,
            k: this.Key
        };
        if (this.CustomData && Object.keys(this.CustomData).length > 0) {
            obj['cd'] = this.CustomData;
        }
        var jsonData = JSON.stringify(obj);
        return QueueITHelpers_1.Utils.stringToUint8Array(jsonData);
    };
    PayloadDto.DeserializePayload = function (input, secretKey, tokenIdentifier) {
        var headerEncrypted = Base64_1.Base64.decode(input);
        var decryptedBytes = QueueITHelpers_1.AESEncryption.DecryptPayload(secretKey, tokenIdentifier, headerEncrypted);
        var jsonData = JSON.parse(QueueITHelpers_1.Utils.uint8ArrayToString(decryptedBytes));
        if (jsonData == null)
            return null;
        var payload = new PayloadDto();
        payload.RelativeQuality = jsonData['r'];
        payload.Key = jsonData['k'];
        if (jsonData['cd']) {
            payload.CustomData = jsonData['cd'];
        }
        return payload;
    };
    return PayloadDto;
}());
exports.PayloadDto = PayloadDto;
