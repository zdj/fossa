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
        it('should only create a new public and private key if no "name" is specified', function (done) {
            apiKeyUtils.createDHKeys(function (keys) {
                assert.equal(keys.publicKey.length,256);
                assert.equal(keys.privateKey.length,256);
                done();
            });
        });
        it('should write the keys to the specified file "name', function (done) {
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
});
