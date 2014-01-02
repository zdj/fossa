var colors = require('colors');
var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var glob = require("glob");

exports.createKeyAgreement = function (entity1Name, entity2Name, callback) {

    var entity1 = crypto.createDiffieHellman(512);
    var entity1PublicKey = entity1.generateKeys('base64');
    var entity1PrivateKey = entity1.getPrivateKey('base64');

    var prime = entity1.getPrime('base64');

    var entity2 = crypto.createDiffieHellman(entity1.getPrime(), 512);
    var entity2PublicKey = entity2.generateKeys('base64');
    var entity2PrivateKey = entity2.getPrivateKey('base64');

    var secret = entity1.computeSecret(entity2PublicKey, 'base64', 'base64');

    var _keyAgreement = {

        entity1: entity1Name,
        entity2: entity2Name,
        entity1PublicKey: entity1PublicKey,
        entity1PrivateKey: entity1PrivateKey,
        entity2PublicKey: entity2PublicKey,
        entity2PrivateKey: entity2PrivateKey,
        secret: secret,
        prime: prime
    };

    var keys = JSON.stringify(_keyAgreement, null, 4);
    fs.writeFile('lib/keys/' + entity1Name + '_' + entity2Name + '_keyAgreement.json', keys, function (err) {
        if (err) throw err;
        callback(_keyAgreement);
    });
};