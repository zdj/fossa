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
		var path = service['path'];
		console.log(('REST URL: ').white + path.white);
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

		function printTypeAndParams(type, params, method) {
			var paramString = '';
			if (params) {
				paramString = ' ' + JSON.stringify(params, null, 2).grey;
			}
			console.log(method + ': '.grey + type.grey + paramString);
		}

		if (get) {
			var params = get['params'];
			var type = get['type'];	
			var method = 'GET'.green;		
			printTypeAndParams(type, params, method);
			var response = require('./services/' + type).get;
			app.get(path, function(req, res) {
				response(req, res, sendResponse, params);
			});
		}

		if (post) {
			params = post['params'];
			type = post['type'];
			var method = 'POST'.blue;	
			printTypeAndParams(type, params, method);
			response = require('./services/' + type).post;
			app.post(path, function(req, res) {
				response(req, res, sendResponse, params);
			});
		}
		
		if (put) {
			params = put['params'];
			type = put['type'];
			var method = 'PUT'.magenta;	
			printTypeAndParams(type, params, method);
			response = require('./services/' + type).put;
			app.put(path, function(req, res) {
				response(req, res, sendResponse, params);
			});
		}	

		if (_delete) {
			params = _delete['params'];
			type = _delete['type'];
			var method = 'DELETE'.red;	
			printTypeAndParams(type, params, method);
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
