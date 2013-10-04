var conf = require('../lib/config.json');
var fs = require('fs');
var async = require('async');
var util = require('util');

exports.index = function(req, res) {
	
	var restServices = {};	
	
	async.each(conf['services'], function(service, cb) {		
		addServices(service, restServices, function(err) {
			cb(err);
		});							
	}, 
	function(err){			
		res.render('index', {
			title: 'Fossa Simulator',
			services: restServices,
			host: req['headers']['host']
		});
	});	
	
	function addServices(service, restServices, cb) {
		
		if (service['type'] == 'http') {
			
			if(!restServices['http']) {
				restServices['http'] = [];
			}
			
			async.series([
			    function(callback){
			        httpService(service['GET'], 'GET', function(restService) {
						if(restService) {
							restServices['http'].push(restService);
						}
						callback();
			        });
			    },
			    function(callback){
			        httpService(service['POST'], 'POST', function(restService) {
						if(restService) {
							restServices['http'].push(restService);
						}		
						callback();				
			        });			        
			    },
			    function(callback){
			        httpService(service['PUT'], 'PUT', function(restService) {
						if(restService) {
							restServices['http'].push(restService);
						}	
						callback();					
			        });			        
			    },
			    function(callback){
			        httpService(service['DELETE'], 'DELETE', function(restService) {
						if(restService) {
							restServices['http'].push(restService);
						}	
						callback();					
			        });			        
			    }
			],
			function(err, results){
				if(err) {
					cb(err);
				} else {
					cb();
				}
			});
		} else {
			cb();
		}
	}
	
	function httpService(service, method, cb) {
		
		if(service) {			
			
			var restService = {					
				path: service['path'],
				method: method,
				status: '',
				contentType: '',
				response: ''
			}
		
			var params = service['params'];
			
			if(params) {
				
				var statusCode = params['statusCode'];
				if(statusCode) {
					restService['status'] = statusCode;
				}
				
				var headers = params['headers'];
				if(headers) {
					var contentType = headers['Content-Type'];
					if(contentType) {
						restService['contentType'] = contentType;
					}
				}
				
				if(params['response']) {
					var response = JSON.stringify(params['response']);
					restService['response'] = response;
					cb(restService);
				} else if(params['file']) {
					fs.readFile('./lib/files/' + params['file'], function (err, data) {
						if (err) {
							cb(err);
						} else {
							restService['response'] = data;
							cb(restService);
						}
					});
				} else {
					cb(restService);
				}
			} else {
				cb(restService);
			}
		} else {
			cb();
		}		
	}
}
