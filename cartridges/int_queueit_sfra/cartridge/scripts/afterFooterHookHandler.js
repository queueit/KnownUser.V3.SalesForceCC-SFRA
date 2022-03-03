'use strict';

var ISML = require('dw/template/ISML');
var Logger = require('dw/system/Logger');

function afterFooter(params) {
    var templateName = 'hooks/queueitAfterFooter';
    try {
        ISML.renderTemplate(templateName, params);
    } catch (e) {
        Logger.error('Error while rendering template ' + templateName);
    }
}

module.exports = {
    afterFooter: afterFooter
}
