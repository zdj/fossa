var assert = require("assert");
var fs = require("fs");
var fsExtra = require("fs-extra");
var apiKeyUtils = require('../lib/utils/api_key_utils');

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
                    assert.notEqual(prime1.prime, prime2.prime);
                    done();
                });
            });
        })
    });
    describe('get the prime', function () {
        it('should read the prime from the json file', function (done) {
            fs.readFile('lib/security/prime.json', function (err, prime) {
                assert.equal(JSON.parse(prime).prime, apiKeyUtils.getPrime());
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
            apiKeyUtils.createKeys('api', function (keys1) {
                apiKeyUtils.createKeys('api', function (keys2) {
                    assert.notEqual(keys1.privateKey, keys2.privateKey);
                    assert.notEqual(keys1.publicKey, keys2.publicKey);
                    done();
                });
            });
        });
        it('the keys should be different than one another', function (done) {
            apiKeyUtils.createKeys('api', function (keys) {
                assert.notEqual(keys.publicKey, keys.privateKey);
                done();
            });
        });
    });
    describe('get api public and private keys', function () {
        it('should read the keys from the json keys file', function (done) {
            fs.readFile('lib/security/api_keys.json', function (err, json) {
                var keys = JSON.parse(json);
                assert.equal(keys.publicKey, apiKeyUtils.getApiPublicKey());
                assert.equal(keys.privateKey, apiKeyUtils.getApiPrivateKey());
                done();
            });
        });
    });
    describe('create a secret', function () {
        it('should write the generated secret to a file', function (done) {
            apiKeyUtils.createKeys('client', function (json) {
                apiKeyUtils.createSecret('client', function (secret) {
                    assert.equal(44, secret.secret.length);
                    done();
                });
            });
        });
        it('should always create the same secret', function (done) {
            apiKeyUtils.createSecret('client', function (secret1) {
                apiKeyUtils.createSecret('client', function (secret2) {
                    assert.equal(secret1.secret, secret2.secret);
                    done();
                });
            });
        });
    });
    describe('get key pair using public key', function () {
        it('should retrieve the key pair if the public key matches', function (done) {
            apiKeyUtils.createKeys('coolio', function (keys) {
                apiKeyUtils.getKeyPair(keys.publicKey, function (publicKey, privateKey) {
                    assert.equal(keys.publicKey, publicKey);
                    assert.equal(keys.privateKey, privateKey);
                    done();
                });
            });
        });
        it('should return null private key if public key has no match', function (done) {
            apiKeyUtils.createKeys('coolio', function (keys) {
                apiKeyUtils.getKeyPair('fantastic_voyage', function (publicKey, privateKey) {
                    assert.equal('fantastic_voyage', publicKey);
                    assert.equal(null, privateKey);
                    done();
                });
            });
        });
    });
});
