var apiKeyUtils = require('./utils/api_key_utils');
var conf = require('./config.json');
var colors = require('colors');
var _ = require('underscore');

exports.loadServices = function loadScripts(app, cb) {

    var serviceCount = 0;

    console.log();

    conf['services'].forEach(function (service) {
        console.log(('Creating service listener: ').yellow.bold + (service['name']).white.underline);
        console.log();
        var description = service['description'];
        if (description) {
            console.log(('Description: ').white + description.white);
        }
        var type = service['type'];
        console.log(('Service Type: ').white + type.white.italic);
        console.log();

        var alls = getMethodArray(service["ALL"]);
        var gets = getMethodArray(service['GET']);
        var posts = getMethodArray(service['POST']);
        var puts = getMethodArray(service['PUT']);
        var deletes = getMethodArray(service['DELETE']);

        if (alls) {
            gets = alls;
            posts = alls;
            deletes = alls;
            puts = alls;
        }

        function printPathAndParams(path, params, method) {
            var paramString = '';
            if (params) {
                paramString = ' ' + JSON.stringify(params, null, 2).grey;
            }
            console.log(method + ': http://localhost:3000'.yellow + path.yellow + paramString);
            serviceCount++;
        }

        function configMethods(methods, fnct) {
            if (methods) {
                methods.forEach(function (method) {
                    fnct(method)
                });
            }
        }

        function getMethodArray(methods) {
            if (methods) {
                if (!_.isArray(methods)) {
                    methods = [methods];
                }
                return methods;
            }
        }

        var serviceLib = require('./services/' + type);

        configMethods(gets, function (get) {
            printPathAndParams(get['path'], get['params'], 'GET'.green);
            app.get(get['path'], function (req, res) {
                doMethod(req, res, get['params'], serviceLib.get);
            });
        });

        configMethods(posts, function (post) {
            printPathAndParams(post['path'], post['params'], 'POST'.blue);
            app.post(post['path'], function (req, res) {
                doMethod(req, res, post['params'], serviceLib.post);
            });
        });

        configMethods(puts, function (put) {
            printPathAndParams(put['path'], put['params'], 'PUT'.magenta);
            app.put(put['path'], function (req, res) {
                doMethod(req, res, put['params'], serviceLib.put);
            });
        });

        configMethods(deletes, function (_delete) {
            printPathAndParams(_delete['path'], _delete['params'], 'DELETE'.red.bold);
            app.delete(_delete['path'], function (req, res) {
                doMethod(req, res, _delete['params'], serviceLib.delete);
            });
        });

        console.log();
    });

    console.log();

    app.get('/service', function (req, res) {
        var doGet = require('./services/service').get;
        doMethod(req, res, {
            method: req.query.method,
            path: req.query.path
        }, sendResponse, doGet);
    });

    cb(serviceCount);
};

function sendResponse(req, res, data, statusCode) {

    if (!res.get('Content-Type')) {
        var contentType = req.get('Content-Type');
        if (!contentType) {
            contentType = 'text/plain';
        }
        res.set('Content-Type', contentType);
    }

    if (!statusCode) {
        statusCode = 200;
    }

    if (statusCode == 204) {
        res.status(statusCode).send();
    } else {
        if (data) {
            res.set('Content-Length', data.length);
        }
        res.status(statusCode).send(data);
    }
}

function doMethod(req, res, params, method) {
    if(params && params['apiKey']) {
        apiKeyUtils.performAuthCheck(req, res, params, sendResponse, method);
    } else {
        method(req, res, params, sendResponse);
    }
}
