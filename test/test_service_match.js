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
	})	
})

