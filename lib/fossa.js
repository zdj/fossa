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
        	console.log((method + ': ').white + type.yellow);
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
            params = post['params'];
            type = post['type'];
            printTypeAndParams(type, params, "         POST");
            response = require('./services/' + type).post;
            app.post(path, function (req, res) {
                response(req, res, sendResponse, params);
            });
        }

        if (_delete) {
            params = _delete['params'];
            type = _delete['type'];
            printTypeAndParams(type, params, "       DELETE");
			response = require('./services/' + type).delete;
            app.delete(path, function (req, res) {
                response(req, res, sendResponse, params);
            });
        }

        if (put) {
            params = put['params'];
            type = put['type'];
            printTypeAndParams(type, params, "          PUT");
			response = require('./services/' + type).put;
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
	
	if(code==204) {
		res.status(code).send();
	}
	
    if (data) {
        res.setHeader('Content-Length', data.length);
    }
    res.setHeader('Content-Type', contentType);
    res.status(code).send(data);
}