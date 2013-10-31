var fs = require('fs');
var _ = require('underscore');

var get = function(req, res, params, cb) {	
	handleResponse(req, res, params, cb);
};

var handleResponse = function(req, res, params, cb) {

	var headers = params.headers;

	if(headers) {
		var keys = _.keys(headers);
		keys.forEach(function(key) {				
			res.set(key,headers[key]);
		});	
	}

	var response = params.response;
	if (response) {
		cb(req, res, JSON.stringify(response), params.statusCode);
	} else if (params.file) {
		fs.readFile('./lib/files/' + params.file, function (err, data) {
			if (err) {
				cb(req, res, err.toString(), 500);
			} else {
				cb(req, res, data, params.statusCode);
			}
		});
	} else {
		cb(req, res, null, params.statusCode);
	}
}

exports.handleResponse = handleResponse;

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;
