var assert = require("assert");
var echo = require("../lib/services/echo");

describe('Http Service Test', function() {

	describe('GET', function() {
		it('should echo request url', function(done) {

			echo.get({
				url: 'http://barforama.com'
			}, {}, {}, function(req, res, data) {
				assert.equal('http://barforama.com', data);
				done();
			});
		})
	}),
	describe('POST', function() {
		it('should echo request body', function(done) {

			echo.post({
				rawBody: 'I love ham!'
			}, {}, {}, function(req, res, data) {
				assert.equal('I love ham!', data);
				done();
			});
		})
	}),
	describe('DELETE', function() {
		it('should echo request url', function(done) {

			echo.delete({
				url: 'http://barforama.com'
			}, {}, {}, function(req, res, data) {
				assert.equal('http://barforama.com', data);
				done();
			});
		})
	}),
	describe('PUT', function() {
		it('should echo request body', function(done) {

			echo.put({
				rawBody: 'I love ham!'
			}, {}, {}, function(req, res, data) {
				assert.equal('I love ham!', data);
				done();
			});
		})
	})
})
