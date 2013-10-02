var url = require('url');
var fs = require('fs');
var _ = require('underscore');

var get = function(req, res, params, cb) {

	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	
	boolean matchFound = false;
	
	if(_.isArray(params['queryMatch'])) {
		params['queryMatch'].forEach(function(_queryMatch) {				
			var key = _queryMatch['key'];			
			var value = _queryMatch['value'];			
			if(query[key] == value) {
				matchFound = true;
			}
		});
	} else if(_.isArray(params['bodyMatch'])) {
		
	}
	
	cb(req, res, null, params['statusCode']);

	// if (params['contentType']) {
	// 	res.set('Content-Type', params['contentType']);
	// }
	// 
	// var response = params['response'];
	// if (response) {
	// 	cb(req, res, JSON.stringify(response), params['statusCode']);
	// } else if (params['file']) {
	// 	fs.readFile('./lib/files/' + params['file'], function (err, data) {
	// 		if (err) {
	// 			cb(req, res, err.toString(), 500);
	// 		} else {
	// 			cb(req, res, data, params['statusCode']);
	// 		}
	// 	});
	// } else {
	// 	cb(req, res, null, params['statusCode']);
	// }
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;
