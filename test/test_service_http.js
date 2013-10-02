var assert = require("assert");
var http = require("../lib/services/http");

describe('Http Service Test', function() {

	describe('GET', function() {
		it('should return HTTP 200 "Hello!"', function(done) {

			http.get({}, {}, {
				"statusCode": 200,
				"response": "Hello!"
			}, function(req, res, data, statusCode) {
				assert.equal(200, statusCode);
				assert.equal('"Hello!"', data);
				done();
			});
		})
	}),
	describe('PUT', function() {
		it('should return HTTP 204', function(done) {

			http.put({}, {}, {
				"statusCode": 204
			}, function(req, res, data, statusCode) {
				assert.equal(204, statusCode);
				assert(!data);
				done();
			});
		})
	}),
	describe('POST', function() {
		it('should return HTTP 200 with JSON response', function(done) {

			http.post({}, {
				set: function(headerKey, headerValue) {
					assert.equal('Content-Type', headerKey);
					assert.equal('application/json; charset=UTF-8', headerValue);
				}
			}, {
				"statusCode": 200,
				"response": {
					"response": "OK"
				},
				"contentType": "application/json; charset=UTF-8"
			}, function(req, res, data, statusCode) {
				assert.equal(200, statusCode);
				assert.equal('{"response":"OK"}', data);
				done();
			});
		})
	}),
	describe('DELETE', function() {
		it('should return HTTP 404 "Not Found"', function(done) {

			http.put({}, {}, {
				"statusCode": 404,
				"response": "Not Found"
			}, function(req, res, data, statusCode) {
				assert.equal(404, statusCode);
				assert.equal('"Not Found"', data);
				done();
			});
		})
	}),
	describe('GET with file response', function() {
		it('should return HTTP 200 "Hello from a file!"', function(done) {

			http.put({}, {
				set: function(headerKey, headerValue) {
					assert.equal('Content-Type', headerKey);
					assert.equal('text/plain', headerValue);
				}
			}, {
				"statusCode": 200,
				"file": "hello.txt",
				"contentType": "text/plain"
			}, function(req, res, data, statusCode) {
				assert.equal(200, statusCode);
				assert.equal('Hello from a file!', new String(data));
				done();
			});
		})
	})
})
