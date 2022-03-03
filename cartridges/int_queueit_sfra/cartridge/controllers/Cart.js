'use strict';

var server = require('server');
const Site = require("dw/system/Site");

server.extend(module.superModule);

const { QueueItLogProvider } = require('*/cartridge/scripts/QueueItLogProvider.js');
const queueItLogProvider = new QueueItLogProvider(Site.getCurrent());

server.prepend('AddProduct', function(req, res, next){
    queueItLogProvider.logCartEvent('AddProduct', req);
    next();
})
server.prepend('EditProductLineItem', function(req, res, next){
    queueItLogProvider.logCartEvent('EditProductLineItem', req);
    next();
});
server.prepend('UpdateQuantity', function(req, res, next){
    queueItLogProvider.logCartEvent('UpdateQuantity', req);
    next();
});
server.prepend('RemoveProductLineItem', function(req, res, next){
    queueItLogProvider.logCartEvent('RemoveProductLineItem', req);
    next();
});

module.exports = server.exports();
