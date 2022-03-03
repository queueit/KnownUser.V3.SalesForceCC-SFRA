"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderDto = void 0;
var Base64_1 = require("../helpers/Base64");
var QueueITHelpers_1 = require("../QueueITHelpers");
var HeaderDto = /** @class */ (function () {
    function HeaderDto() {
    }
    HeaderDto.DeserializeHeader = function (input) {
        var decoded = Base64_1.Base64.decode(input);
        var jsonData = JSON.parse(QueueITHelpers_1.Utils.uint8ArrayToString(decoded));
        var header = new HeaderDto();
        header.TokenVersion = jsonData['typ'];
        header.Encryption = jsonData['enc'];
        header.Issued = jsonData['iss'];
        header.Expires = jsonData['exp'];
        header.TokenIdentifier = jsonData['ti'];
        header.CustomerId = jsonData['c'];
        header.EventId = jsonData['e'];
        header.IpAddress = jsonData['ip'];
        header.XForwardedFor = jsonData['xff'];
        return header;
    };
    HeaderDto.prototype.Serialize = function () {
        var obj = {
            typ: this.TokenVersion,
            enc: this.Encryption,
            iss: this.Issued
        };
        if (this.Expires)
            obj['exp'] = this.Expires;
        obj["ti"] = this.TokenIdentifier;
        obj["c"] = this.CustomerId;
        if (this.EventId)
            obj['e'] = this.EventId;
        if (this.IpAddress)
            obj['ip'] = this.IpAddress;
        if (this.XForwardedFor)
            obj['xff'] = this.XForwardedFor;
        var jsonData = JSON.stringify(obj);
        return Base64_1.Base64.encode(QueueITHelpers_1.Utils.stringToUint8Array(jsonData));
    };
    return HeaderDto;
}());
exports.HeaderDto = HeaderDto;
