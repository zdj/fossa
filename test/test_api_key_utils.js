var assert = require("assert");
var fs = require("fs");
var fsExtra = require("fs-extra");
var apiKeyUtils = require('../scripts/api_key_utils');

describe('API Key Utils Tests', function () {

    before(function (done) {
        fs.rename('lib/security', 'lib/security_old', function (err1) {
            fs.mkdir('lib/security', function (err1) {
                done();
            });
        });
    });

    after(function (done) {
        fsExtra.remove('lib/security', function (err1) {
            fs.rename('lib/security_old', 'lib/security', function (err1) {
                fsExtra.remove('lib/security_old', function (err1) {
                    if (err1) throw err1
                    done();
                });
            });
        });
    });

    describe('create a prime', function () {
        it('should write the generated prime to a file', function (done) {
            apiKeyUtils.createPrime(function (json) {
                fs.readFile('lib/security/prime.json', function (err, prime) {
                    assert(!err);
                    assert.equal(44, JSON.parse(prime).prime.length);
                    done();
                });
            });
        });
        it('should not create the same prime twice', function (done) {
            apiKeyUtils.createPrime(function (prime1) {
                apiKeyUtils.createPrime(function (prime2) {
                    assert.notEqual(JSON.parse(prime1).prime, JSON.parse(prime2).prime);
                    done();
                });
            });
        })
    });
    describe('get the prime from the file', function () {
        it('should read the prime from saved file', function (done) {
            apiKeyUtils.getPrime(function (prime) {
                assert.equal(44, prime.length);
                done();
            });
        });
    });
    describe('create a pair of keys', function () {
        it('should write the keys to a file', function (done) {
            apiKeyUtils.createKeys('api', function (data) {
                fs.readFile('lib/security/api_keys.json', function (err, json) {
                    var keys = JSON.parse(json);
                    assert.equal(44, keys.privateKey.length);
                    assert.equal(44, keys.publicKey.length);
                    done();
                });
            });
        });
        it('should not create the same keys twice', function (done) {
            apiKeyUtils.createKeys('api', function (json1) {
                var keys1 = JSON.parse(json1);
                apiKeyUtils.createKeys('api', function (json2) {
                    var keys2 = JSON.parse(json2);
                    assert.notEqual(keys1.privateKey, keys2.privateKey);
                    assert.notEqual(keys1.publicKey, keys2.publicKey);
                    done();
                });
            });
        });
        it('the keys should be different than one another', function (done) {
            apiKeyUtils.createKeys('api', function (json) {
                var keys = JSON.parse(json);
                assert.notEqual(keys.publicKey, keys.privateKey);
                done();
            });
        });
    });
    describe('get the keys from the file', function () {
        it('should read the keys from saved file', function (done) {
            apiKeyUtils.getKeys('api', function (publicKey, privateKey) {
                assert.equal(44, publicKey.length);
                assert.equal(44, privateKey.length);
                done();
            });
        });
    });
    describe('create a secret', function () {
        it('should write the generated secret to a file', function (done) {
            apiKeyUtils.createKeys('client', function (json) {
                apiKeyUtils.createSecret('client', function (json) {
                    var secret = JSON.parse(json);
                    assert.equal(44, secret.secret.length);
                    done();
                });
            });
        });
        it('should always create the same secret', function (done) {
            apiKeyUtils.createSecret('client', function (json1) {
                apiKeyUtils.createSecret('client', function (json2) {
                    var secret1 = JSON.parse(json1).secret;
                    var secret2 = JSON.parse(json2).secret;
                    assert.equal(secret1, secret2);
                    done();
                });
            });
        });
    });
});
