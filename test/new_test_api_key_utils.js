var assert = require("assert");
var fs = require("fs");
var fsExtra = require("fs-extra");
var apiKeyUtils = require('../lib/utils/new_api_key_utils');

describe('New API Key Utils Tests', function () {

    before(function (done) {
        fs.rename('lib/keys', 'lib/keys_old', function (err1) {
            fs.mkdir('lib/keys', function (err1) {
                done();
            });
        });
    });

    after(function (done) {
        fsExtra.remove('lib/keys', function (err1) {
            fs.rename('lib/keys_old', 'lib/keys', function (err1) {
                fsExtra.remove('lib/keys_old', function (err1) {
                    if (err1) throw err1;
                    done();
                });
            });
        });
    });

    describe('create a key pair', function () {
        it('should only create a new public and private key if no "entity" is specified', function (done) {
            apiKeyUtils.createDHKeys(function (keys) {
                assert.equal(keys.publicKey.length,88);
                assert.equal(keys.privateKey.length,88);
                done();
            });
        });
        it('should write the keys to the specified file "entity "', function (done) {
            apiKeyUtils.createDHKeys(function (keys) {
                fs.readFile('lib/keys/client.json', function (err, data) {
                    assert(!err);
                    var _keys = JSON.parse(data);
                    assert.equal(keys.publicKey, _keys.publicKey);
                    assert.equal(keys.privateKey, _keys.privateKey);
                    done();
                });
            }, "client");
        });
    });

    describe('create a shared secret', function () {
        it('should throw an error if both entity names are not provided', function (done) {
            try {
                apiKeyUtils.createSharedSecret('entity1', null, function (sharedSecret) {
                    assert.equal(sharedSecret.secret.length, 88);
                    done();
                });
            } catch (e) {
                assert.equal(e.message,"'entity1' and 'entity2' are required");
                done();
            }
        });
        it('should write the keys to the specified file "entity "', function (done) {
            apiKeyUtils.createDHKeys(function (keys1) {
                apiKeyUtils.createDHKeys(function (keys2) {
                    apiKeyUtils.createSharedSecret('entity1', 'entity2', function (sharedSecret) {
                        assert.equal(sharedSecret.secret.length,88);
                        done();
                    });
                },'entity2');
            },'entity1');
        });
    });
});
