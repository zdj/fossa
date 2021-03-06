var apiKeyUtils = require('./utils/api_key_utils');
var async = require('async');
var colors = require('colors');
var _ = require('underscore');
var fs = require('fs');

exports.loadServices = function loadScripts(app, cb) {

    var serviceCount = 0;

    fs.readdir('lib/config', function (err, files) {

        async.each(_.without(files, 'config.sample.json'), function (file, callback) {

            configure(require('../lib/config/' + file), app, function (_serviceCount) {
                serviceCount += _serviceCount;
                callback();
            });

        }, function (err) {

            addUiService(app);

            console.log();
            cb(serviceCount);
        });
    });
};

function configure(conf, app, cb) {

    var serviceCount = 0;

    console.log();

    async.each(conf['services'], function (service, callback) {

        console.log(('Creating service listener: ').yellow.bold + (service['name']).white.underline);
        console.log();
        var description = service['description'];
        if (description) {
            console.log(('Description: ').white + description.white);
        }
        var type = service['type'];
        console.log(('Service Type: ').white + type.cyan.italic);
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
            console.log(method + (': http://localhost:' + app.settings.port + path).yellow + paramString);
            serviceCount++;
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

        callback();

    }, function (err) {

        console.log();
        cb(serviceCount);
    });
}

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
    if (params && params['apiKey']) {
        apiKeyUtils.performAuthCheck(req, res, params, method, sendResponse);
    } else {
        method(req, res, params, sendResponse);
    }
}

function getMethodArray(methods) {
    if (methods) {
        if (!_.isArray(methods)) {
            methods = [methods];
        }
    }
    return methods;
}

function configMethods(methods, cb) {
    if (methods) {
        methods.forEach(function (method) {
            cb(method)
        });
    }
}

function addUiService(app) {
    app.get('/service', function (req, res) {
        var doGet = require('./services/service').get;
        doMethod(req, res, {
            method: req.query.method,
            path: req.query.path
        }, doGet);
    });
}
