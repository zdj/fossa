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
		var _delete = service['DELETE'];
		var put = service['PUT'];

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
			var params = get['params'];
			var path = get['path'];	
			var method = 'GET'.green;		
			printPathAndParams(path, params, method);
			var response = require('./services/' + type).get;
			app.get(path, function(req, res) {
				response(req, res, sendResponse, params);
			});
		}

		if (post) {
			var params = post['params'];
			var path = post['path'];
			var method = 'POST'.blue;	
			printPathAndParams(path, params, method);
			response = require('./services/' + type).post;
			app.post(path, function(req, res) {
				response(req, res, sendResponse, params);
			});
		}
		
		if (put) {
			var params = put['params'];
			var path = put['path'];
			var method = 'PUT'.magenta;	
			printPathAndParams(path, params, method);
			response = require('./services/' + type).put;
			app.put(path, function(req, res) {
				response(req, res, sendResponse, params);
			});
		}	

		if (_delete) {
			var params = _delete['params'];
			var path = _delete['path'];
			var method = 'DELETE'.red;	
			printPathAndParams(path, params, method);
			response = require('./services/' + type).delete;
			app.delete(path, function(req, res) {
				response(req, res, sendResponse, params);
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
