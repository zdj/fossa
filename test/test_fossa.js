var assert = require("assert");
var _ = require("underscore");
var fossa = require("../lib/fossa");

describe('Fossa Config Test', function() {
	
	before(function(done) {		
		fossa.loadServices(app, function(_serviceCount) {
			serviceCount = _serviceCount;
			done();
		});
	});
	
	describe('loadServices using default config.json', function() {
		it('should create 24 services', function(done) {
			assert.equal(33, serviceCount);
			assert.equal(10, _.keys(services['GET']).length);
			assert.equal(10, _.keys(services['POST']).length);
			assert.equal(9, _.keys(services['PUT']).length);
			assert.equal(4, _.keys(services['DELETE']).length);
			done();
		})
	})
});

var services = {
	"GET": [
	],
	"POST": [
	],
	"PUT": [
	],
	"DELETE": [
	]		
};

var app = new function() {

    this.settings = {
        port:3000
    };
	
	this.get = function(path,service){
		services['GET'][path] = service;
	};
	
	this.post = function(path,service){
		services['POST'][path] = service;
	};
	
	this.put = function(path,service){
		services['PUT'][path] = service;
	};
	
	this.delete = function(path,service){
		services['DELETE'][path] = service;
	};
	
	this.all = function(path,service){};
}
