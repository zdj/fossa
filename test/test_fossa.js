var assert = require("assert");
var fossa = require("../lib/fossa");

describe('Fossa Config Test', function() {
	
	before(function(done) {		
		fossa.loadServices(app, function(_serviceCount) {
			serviceCount = _serviceCount;
			done();
		});
	});
	
	describe('loadServices using default config.json', function() {
		it('should create 21 services', function(done) {
			assert.equal(21, serviceCount);
			assert.equal(21, services.length);
			done();
		})
		it('should create http services', function(done) {
			done();
		})
	})
})

var services = [];

var app = new function() {
	this.get = function(get,service){
		services.push(service);
	};
	this.post = function(get,service){
		services.push(service);
	};
	this.put = function(get,service){
		services.push(service);
	};
	this.delete = function(get,service){
		services.push(service);
	};
	this.all = function(get,service){};
}
