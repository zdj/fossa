var conf = require('./config.json');
var colors = require('colors');

exports.loadScripts = function loadScripts(app) {

    console.log();

    conf['services'].forEach(function (service) {
        console.log(('Creating service listener: ' + service['name']).green);
        var description = service['description'];
        if (description) {
            console.log(('  Description: ').white + description.white);
        }
        var path = service['path'];
        console.log((' Context Path: ').white + path.yellow);

        var all = service["ALL"];
        var get = service['GET'];
        var post = service['POST'];
        var _delete = service['DELETE'];
        var put = service['PUT'];

        if (all) {
            get = all;
            post = all;
            _delete = all;
            put = all;
        }

        function printTypeAndParams(type, params, method) {
            if (params) {
                console.log((method + ': ').white + type.yellow + '  ' + JSON.stringify(params).cyan);
            } else {
                console.log((method + ': ').white + type.yellow);
            }
        }

        if (get) {
            var params = get['params'];
            var type = get['type'];
            printTypeAndParams(type, params, "          GET");
            var response = require('./services/' + type).get;
            app.get(path, function (req, res) {
                response(req, res, sendResponse, params);
            });
        }

        if (post) {
            var params = post['params'];
            var type = post['type'];
            printTypeAndParams(type, params, "         POST");
            var response = require('./services/' + type).post;
            app.post(path, function (req, res) {
                response(req, res, sendResponse, params);
            });
        }

        if (_delete) {
            var params = _delete['params'];
            var type = _delete['type'];
            printTypeAndParams(type, params, "       DELETE");
			var response = require('./services/' + type).delete;
            app.delete(path, function (req, res) {
                response(req, res, sendResponse, params);
            });
        }

        if (put) {
            var params = put['params'];
            var type = put['type'];
            printTypeAndParams(type, params, "          PUT");
			var response = require('./services/' + type).put;
            app.put(path, function (req, res) {
                response(req, res, sendResponse, params);
            });
        }

        console.log();
    });

    console.log();
}

function sendResponse(req, res, data, code) {

    var contentType = req.header("Content-Type");
    if (!contentType) {
        contentType = 'text/plain';
    }
    if (!code) {
        code = 200;
    }
    if (data) {
        res.setHeader('Content-Length', data.length);
    }
    res.setHeader('Content-Type', 'text/plain');
    res.status(code).send(data);
}