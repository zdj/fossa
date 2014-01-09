var assert = require('assert');
var fs = require('fs');
var colors = require('colors');
var fsExtra = require('fs-extra');
var apiKeyUtils = require('../lib/utils/api_key_utils');

var response = {
    set: function(headerName, headerValue) {
        if(headerName!='Content-Type') {
            assert(false, "expected to set Content-Type header");
        } else {
            if(headerValue!='application/json') {
                assert(false, "expected to set Content-Type header value to application/json but was '" + headerValue + "'");
            }
        }
    }
};

var notAuthorizedMessage = JSON.stringify({error:"Not authorized"},null,4);

describe('New API Key Utils Tests', function () {

    beforeEach(function (done) {
        fsExtra.delete('lib/keys/server_client_keyAgreement.json', function (err) {
            console.log("successfully deleted lib/keys/server_client_keyAgreement.json".green);
            done();
        });
    });

    describe('create a key agreement', function () {
        it('should write the key agreement to a file', function (done) {
            apiKeyUtils.createKeyAgreement(function (keyAgreement) {
                fs.readFile('lib/keys/server_client_keyAgreement.json', function (err, data) {
                    var _keyAgreement = JSON.parse(data);
                    assert.equal(_keyAgreement.entity1, keyAgreement.entity1);
                    assert.equal(keyAgreement.entity1, 'server');
                    assert.equal(keyAgreement.entity1PublicKey.length, 88);
                    assert.equal(keyAgreement.entity1PrivateKey.length, 88);
                    assert.equal(keyAgreement.entity2, 'client');
                    assert.equal(keyAgreement.entity2PublicKey.length, 88);
                    assert.equal(keyAgreement.entity2PrivateKey.length, 88);
                    assert.equal(keyAgreement.secret.length, 88);
                    assert.equal(keyAgreement.prime.length, 88);
                    done();
                });
            });
        });
    });

    describe('get key agreement', function () {
        it('should return the key agreement by entity2 public key', function (done) {
            apiKeyUtils.createKeyAgreement(function (keyAgreement) {
                apiKeyUtils.getKeyAgreement(keyAgreement.entity2PublicKey, function (_keyAgreement) {
                    assert.equal(_keyAgreement.entity1PrivateKey, keyAgreement.entity1PrivateKey);
                    done();
                });
            });
        });
    });

    describe('perform authentication check', function () {
        it("should not allow access if 'Authentication' header is missing the apiKey", function (done) {
            var request = {
                header: function (name) {
                    return "beefaroni";
                }
            };
            var params = {
            };
            var callback = function (req, res, message, statusCode) {
                assert.equal(401, statusCode);
                assert.equal(notAuthorizedMessage, message);
                done();
            };
            var methodToCall = function () {
            };
            apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
        });
        it("should not allow access if 'Authentication' header is missing", function (done) {
            var request = {
                header: function (name) {
                    return null;
                }
            };
            var params = {
            };
            var callback = function (req, res, message, statusCode) {
                assert.equal(401, statusCode);
                assert.equal(notAuthorizedMessage, message);
                done();
            };
            var methodToCall = function () {
            };
            apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
        });
        it("should not allow access if the apiKey is in the wrong place", function (done) {
            var request = {
                header: function (name) {
                    return " a_pee_eye_key";
                }
            };
            var params = {
                "apiKey": "a_pee_eye_key"
            };
            var callback = function (req, res, message, statusCode) {
                assert.equal(401, statusCode);
                assert.equal(notAuthorizedMessage, message);
                done();
            };
            var methodToCall = function () {
            };
            apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
        });
        it("should not allow access if the apiKey value doesn't exist", function (done) {
            var request = {
                header: function (name) {
                    return "a_pee_eye_key";
                }
            };
            var params = {
                "apiKey": "a_pee_eye_key"
            };
            var callback = function (req, res, message, statusCode) {
                assert.equal(401, statusCode);
                assert.equal(notAuthorizedMessage, message);
                done();
            };
            var methodToCall = function () {
            };
            apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
        });
        it("should not allow access if the apiKey value isn't separated with a colon", function (done) {
            var request = {
                header: function (name) {
                    return "a_pee_eye_key donkeykong";
                }
            };
            var params = {
                "apiKey": "a_pee_eye_key"
            };
            var callback = function (req, res, message, statusCode) {
                assert.equal(401, statusCode);
                assert.equal(notAuthorizedMessage, message);
                done();
            };
            var methodToCall = function () {
            };
            apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
        });
        it("should not allow access if the apiKey value's public key is empty", function (done) {
            apiKeyUtils.createKeyAgreement(function (keyAgreement) {
                var request = {
                    header: function (name) {
                        return "a_pee_eye_key :kong";
                    }
                };
                var params = {
                    "apiKey": "a_pee_eye_key"
                };
                var callback = function (req, res, message, statusCode) {
                    assert.equal(401, statusCode);
                    assert.equal(notAuthorizedMessage, message);
                    done();
                };
                var methodToCall = function () {
                };
                apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
            });
        });
        it("should not allow access if the apiKey value's hmac hash is empty", function (done) {
            apiKeyUtils.createKeyAgreement(function (keyAgreement) {
                var request = {
                    header: function (name) {
                        return "a_pee_eye_key donkey:";
                    }
                };
                var params = {
                    "apiKey": "a_pee_eye_key"
                };
                var callback = function (req, res, message, statusCode) {
                    assert.equal(401, statusCode);
                    assert.equal(notAuthorizedMessage, message);
                    done();
                };
                var methodToCall = function () {
                };
                apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
            });
        });
        it("should not allow access if the apiKey value's public key doesn't match a private key", function (done) {

            apiKeyUtils.createKeyAgreement(function (keyAgreement) {

                var request = {
                    header: function (name) {
                        return "a_pee_eye_key donkey:kong";
                    }
                };
                var params = {
                    "apiKey": "a_pee_eye_key"
                };
                var callback = function (req, res, message, statusCode) {
                    assert.equal(401, statusCode);
                    assert.equal(notAuthorizedMessage, message);
                    done();
                };
                var methodToCall = function () {
                };
                apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
            });
        });
        it("should not allow access if the hmac hashes don't match", function (done) {

            apiKeyUtils.createKeyAgreement(function (keyAgreement) {
                var data = JSON.stringify({
                    "message": "whats up!"
                });
                var headers = {
                    'Date': '     ' + new Date().toString(),
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                };
                var method = 'POST';

                var canonicalizedHeaders = apiKeyUtils.getCanonicalizedHeaders(headers);
                var canonicalizedResource = '/secure/logger';
                var hmacHash = apiKeyUtils.createHmacHash(data, method, canonicalizedHeaders, canonicalizedResource, keyAgreement);
                var publicKey = keyAgreement.entity2PublicKey;

                var request = {
                    header: function (name) {
                        if (name == 'Authorization') {
                            return "a_pee_eye_key " + publicKey + ":" + hmacHash;
                        } else {
                            return null;
                        }
                    },
                    headers: headers,
                    method: method,
                    url: '/secure/logger',
                    rawBody: JSON.stringify({
                        "message": "whats up dude!"
                    })
                };
                var params = {
                    "apiKey": "a_pee_eye_key"
                };
                var callback = function (req, res, message, statusCode) {
                    assert.equal(401, statusCode);
                    assert.equal(notAuthorizedMessage, message);
                    done();
                };
                var methodToCall = function () {
                };

                apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
            });
        });
        it("should allow access if the hmac hashes match", function (done) {

            apiKeyUtils.createKeyAgreement(function (keyAgreement) {

                var data = JSON.stringify({
                    "message": "whats up!"
                });
                var headers = {
                    'Date': '     ' + new Date().toString(),
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                };
                var method = 'POST';

                var canonicalizedHeaders = apiKeyUtils.getCanonicalizedHeaders(headers);
                var canonicalizedResource = apiKeyUtils.getCanonizalizedResource('/secure/logger');
                var hmacHash = apiKeyUtils.createHmacHash(data, method, canonicalizedHeaders, canonicalizedResource, keyAgreement);
                var publicKey = keyAgreement.entity2PublicKey;

                var request = {
                    header: function (name) {
                        if (name == 'Authorization') {
                            return "a_pee_eye_key " + publicKey + ":" + hmacHash;
                        } else {
                            return null;
                        }
                    },
                    headers: headers,
                    method: method,
                    url: '/secure/logger',
                    rawBody: data
                };
                var params = {
                    "apiKey": "a_pee_eye_key"
                };
                var callback = function (req, res, message, statusCode) {
                    assert(false, "expected method was not called, got a " + statusCode + ": " + message + " instead");
                };
                var methodToCall = function (req, res, params, cb) {
                    done();
                };

                apiKeyUtils.performAuthCheck(request, response, params, methodToCall, callback);
            });
        });
    });
});