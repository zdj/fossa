var conf = require('../lib/config.json');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
require('colors');

exports.index = function (req, res) {

    var jadeContext = {
        title: 'Fossa Simulator',
        services: {},
        host: req.headers.host
    };

    var restServices = {};

    async.eachLimit(conf.services, 1, function (service, cb) {
            addRestServices(service, restServices, function (err) {
                jadeContext.services = restServices;
                cb(err);
            });
        },
        function (err) {

            if (err) {
                console.log('index.js - '.red.bold + err.toString().red);
            }

            res.render('index', jadeContext);
        });

    function addRestServices(fossaService, restServices, cb) {

        var serviceType = fossaService.type;

        try {
            var jadeContextBuilder = require('../lib/services/ui/' + serviceType);
        } catch (err) {
            console.log('index.js - '.red.bold + err.toString().red);
        }

        if(jadeContextBuilder) {
            
            if (!restServices[serviceType]) {
                restServices[serviceType] = [];
            }

            async.eachLimit(['GET', 'PUT', 'POST', 'DELETE'], 1, function (method, _cb) {
                                
                var httpService = fossaService[method];
                if(httpService) {
                    httpService.method = method
                    jadeContextBuilder.buildJadeContext(fossaService[method], function (err, restService) {
                        if (err) {
                            _cb(err);
                        } else {
                            if (restService) {
                                restServices[serviceType].push(restService);
                            }
                            _cb(null);
                        }
                    });  
                } else {
                    _cb(null);
                }
            },
            function (err) {
                cb(err);
            });
        } else {
            cb(null);
        }
    }
};
