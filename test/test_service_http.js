var assert = require("assert");
var fossa = require("../lib/services/http");

describe('Http Service Test', function() {
	
	describe('GET', function() {
		it('should create 21 services', function(done) {
			assert.equal(21, serviceCount);
			assert.equal(4, _.keys(services['GET']).length);
			assert.equal(7, _.keys(services['POST']).length);
			assert.equal(7, _.keys(services['PUT']).length);
			assert.equal(3, _.keys(services['DELETE']).length);
			done();
		})
	})
})