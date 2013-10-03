var fs = require('fs');
var _ = require('underscore');
var http = require('./http')

var get = function(req, res, params, cb) {
	
	var matchFound = false;
	
	function testMatch(matcher, stringToMatch) {
		if(!matchFound && stringToMatch.indexOf(matcher['string'])>-1) {
			http.handleResponse(req, res, matcher, cb);
			matchFound = true;
		}
	}
	
	if(_.isArray(params['urlMatch'])) {
		params['urlMatch'].forEach(function(_urlMatch) {				
			testMatch(_urlMatch,req.url);
		});		
	} else if(_.isArray(params['bodyMatch'])) {
		params['bodyMatch'].forEach(function(_bodyMatch) {
			testMatch(_bodyMatch,req.rawBody );
		});
	} else if(_.isArray(params['headerMatch'])) {
		params['headerMatch'].forEach(function(_headerMatch) {
			if(!matchFound && _headerMatch['key'] && _headerMatch['value']) {
				if(req.get(_headerMatch['key']) == _headerMatch['value']) {
					http.handleResponse(req, res, _headerMatch, cb);
					matchFound = true;
				}
			}
		});
	}		
	
	if(!matchFound) {
		cb(req, res, 'No match found', 400);
	}
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;
