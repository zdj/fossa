var assert = require("assert");
var http = require("../lib/services/match");

describe('Match Service Test', function() {

	describe('GET with url match', function() {
		it('should return HTTP 200 {"yes": "please"}', function(done) {

			http.get({
				url: 'http://sandwichmakerz.net?beef=ravioli&ham=cheese&pork=rinds'
			}, {}, {
				"urlMatch": [{
					"string": "ham=cheese",
					"statusCode": 200,
					"response": {
						"yes": "please"
					},
					"contentType": "application/json; charset=UTF-8"
				}, {
					"string": "?peanutButter",
					"statusCode": 204
				}]				
			}, function(req, res, data, statusCode) {
				assert.equal(200, statusCode);
				assert.equal('{"yes":"please"}', data);
				done();
			});
		})
	}),
	describe('POST with body match', function() {
		it('should return HTTP 200 {"yes": "please"}', function(done) {

			http.get({
				url: 'http://sandwichmakerz.net?beef=ravioli&ham=cheese&pork=rinds'
			}, {}, {
				"urlMatch": [{
					"string": "ham=cheese",
					"statusCode": 200,
					"response": {
						"yes": "please"
					},
					"contentType": "application/json; charset=UTF-8"
				}, {
					"string": "?peanutButter",
					"statusCode": 204
				}]				
			}, function(req, res, data, statusCode) {
				assert.equal(200, statusCode);
				assert.equal('{"yes":"please"}', data);
				done();
			});
		})
	}),
	describe('PUT with header match', function() {
		it('should return HTTP 200 {"yes": "please"}', function(done) {

			http.get({
				get: function(key) {
					if(key == "Ham") {
						return "Cheese";
					} else {
						return null;
					}
				}
			}, {}, {
				"headerMatch": [{
					"key": "Ham",
					"value": "Cheese",
					"statusCode": 200,
					"file": "hello.txt"
				}]						
			}, function(req, res, data, statusCode) {
				assert.equal(200, statusCode);
				assert.equal('Hello from a file!', new String(data));
				done();
			});
		})
	})
})

