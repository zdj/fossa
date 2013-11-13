require('colors');
var conf = require('./config.json');

exports.loadServices = function loadScripts(app, cb) {

	var serviceCount = 0;

	console.log();

	conf['services'].forEach(function(service) {
		console.log(('Creating service listener: ').yellow + (service.name).white.underline);
		console.log();
		var description = service.description;
		if (description) {
			console.log(('Description: ').white + description.white);
		}
		var type = service.type;
		console.log(('Service Type: ').white + type.cyan.italic);
		console.log();

		var all = service.ALL;
		var get = service.GET;
		var post = service.POST;
		var put = service.PUT;
        var _delete = service.DELETE;
		
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
			console.log(method + ': http://localhost:3000'.yellow + path.yellow + paramString);
			serviceCount++;
		}

		if (get) {
			printPathAndParams(get.path, get.params, 'GET'.green);
			app.get(get.path, function(req, res) {				
				require('./services/' + type).get(req, res, get.params, sendResponse);
			});
		}

		if (post) {
			printPathAndParams(post.path, post.params, 'POST'.blue);
			app.post(post.path, function(req, res) {				
				var svc = require('./services/' + type).post(req, res, post.params, sendResponse);
			});
		}
		
		if (put) {
			printPathAndParams(put.path, put.params, 'PUT'.magenta);
			app.put(put.path, function(req, res) {
				require('./services/' + type).put(req, res, put.params, sendResponse);
			});
		}

		if (_delete) {
			printPathAndParams(_delete.path, _delete.params, 'DELETE'.red.bold);
			app.delete(_delete.path, function(req, res) {
				require('./services/' + type).delete(req, res, _delete.params, sendResponse);
			});
		}

		console.log();
	});

	console.log();

    app.get('/service', function(req,res) {
        require('./services/service').get(req, res, req.query, sendResponse);
    });
	
	cb(serviceCount);
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
