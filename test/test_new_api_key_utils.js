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

    describe('create a key agreement', function () {
        it('should write the key agreement to a file', function (done) {
            apiKeyUtils.createKeyAgreement('server', 'client', function(keyAgreement) {
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
});