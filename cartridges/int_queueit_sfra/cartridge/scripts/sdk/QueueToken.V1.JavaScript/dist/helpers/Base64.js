"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base64 = void 0;
var QueueITHelpers_1 = require("../QueueITHelpers");
var Base64 = /** @class */ (function () {
    function Base64() {
    }
    Base64.getByte64 = function (s, i) {
        return Base64.ALPHA.indexOf(s.charAt(i));
    };
    Base64.decode = function (s) {
        s = s.split('-').join('+')
            .split('_').join('/');
        if (s.length === 0) {
            return new Uint8Array(0);
        }
        var padding = s.length % 4;
        if (padding == 3)
            padding = 1;
        s = QueueITHelpers_1.Utils.padRight(s, "=", s.length + padding);
        var pads = 0, i, b10, imax = s.length, x = [];
        if (s.charAt(imax - 1) === Base64.PADCHAR) {
            pads = 1;
            if (s.charAt(imax - 2) === Base64.PADCHAR) {
                pads = 2;
            }
            imax -= 4;
        }
        for (i = 0; i < imax; i += 4) {
            b10 = (Base64.getByte64(s, i) << 18) | (Base64.getByte64(s, i + 1) << 12) | (Base64.getByte64(s, i + 2) << 6) | Base64.getByte64(s, i + 3);
            x.push(b10 >> 16, (b10 >> 8) & 255, b10 & 255);
        }
        switch (pads) {
            case 1:
                b10 = (Base64.getByte64(s, i) << 18) | (Base64.getByte64(s, i + 1) << 12) | (Base64.getByte64(s, i + 2) << 6);
                x.push(b10 >> 16, (b10 >> 8) & 255);
                break;
            case 2:
                b10 = (Base64.getByte64(s, i) << 18) | (Base64.getByte64(s, i + 1) << 12);
                x.push(b10 >> 16);
                break;
        }
        return new Uint8Array(x);
    };
    Base64.encode = function (s) {
        var i, b10, x = [], imax = s.length - s.length % 3;
        if (s.length === 0) {
            return s.toString();
        }
        for (i = 0; i < imax; i += 3) {
            b10 = (s[i] << 16) | (s[i + 1] << 8) | s[i + 2];
            x.push(this.ALPHA.charAt(b10 >> 18));
            x.push(this.ALPHA.charAt((b10 >> 12) & 63));
            x.push(this.ALPHA.charAt((b10 >> 6) & 63));
            x.push(this.ALPHA.charAt(b10 & 63));
        }
        switch (s.length - imax) {
            case 1:
                b10 = s[i] << 16;
                x.push(Base64.ALPHA.charAt(b10 >> 18) + Base64.ALPHA.charAt((b10 >> 12) & 63) + Base64.PADCHAR + Base64.PADCHAR);
                break;
            case 2:
                b10 = (s[i] << 16) | (s[i + 1] << 8);
                x.push(Base64.ALPHA.charAt(b10 >> 18) + Base64.ALPHA.charAt((b10 >> 12) & 63) + Base64.ALPHA.charAt((b10 >> 6) & 63) + Base64.PADCHAR);
                break;
        }
        var encoded = x.join('')
            .split('+').join('-')
            .split('/').join('_');
        return trimEnd(encoded, '=');
    };
    Base64.PADCHAR = '=';
    Base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    return Base64;
}());
exports.Base64 = Base64;
function trimEnd(value, charsToTrim) {
    if (value.length == 0)
        return "";
    var i = value.length;
    for (; i >= 0;) {
        var contained = charsToTrim.indexOf(value.charAt(i)) != -1;
        if (!contained) {
            break;
        }
        i--;
    }
    return value.substring(0, i + 1);
}
