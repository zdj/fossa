var conf = require('./config.json');
var colors = require('colors');

exports.loadScripts = function loadScripts(app) {

	console.log();

	conf['services'].forEach(function(service) {
		console.log(('Creating service listener: ').yellow.bold + (service['name']).white.underline);
		console.log();
		var description = service['description'];
		if (description) {
			console.log(('Description: ').white + description.white);
		}
		var type = service['type'];
		console.log(('Service Type: ').white + type.white.italic);
		console.log();

		var all = service["ALL"];
		var get = service['GET'];
		var post = service['POST'];
		var put = service['PUT'];
        var _delete = service['DELETE'];
		
		if (all) {
			get = all;
			post = all;
			_delete = all;
			put = all;
		}
		
		function printPathAndParams(path, params, method) {
			var paramString = '';
			if (params) {
				paramString = ' ' + JSON.stringify(params, null, 2).grey;
			}
			console.log(method + ': '.grey + path.grey + paramString);
		}

		if (get) {
			printPathAndParams(get['path'], get['params'], 'GET'.green);
			app.get(get['path'], function(req, res) {
				require('./services/' + type).get(req, res, sendResponse, get['params']);
			});
		}

		if (post) {
			printPathAndParams(post['path'], post['params'], 'POST'.blue);
			app.post(post['path'], function(req, res) {
				require('./services/' + type).post(req, res, sendResponse, post['params']);
			});
		}
		
		if (put) {
			printPathAndParams(put['path'], put['params'], 'PUT'.blue);
			app.put(put['path'], function(req, res) {
				require('./services/' + type).put(req, res, sendResponse, put['params']);
			});
		}

		if (_delete) {
			printPathAndParams(_delete['path'], _delete['params'], 'DELETE'.red);
			app.delete(_delete['path'], function(req, res) {
				require('./services/' + type).delete(req, res, sendResponse, _delete['params']);
			});
		}

		console.log();
	});

	console.log();
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
