var colors = require('colors');
var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var glob = require("glob");

exports.createDHKeys = createKeys = function (callback,entity) {

    var dh = crypto.createDiffieHellman(512);
    var publicKey = dh.generateKeys('base64');
    var privateKey = dh.getPrivateKey('base64');
    var prime = dh.getPrime('base64');

    var keys = {
        publicKey: publicKey,
        privateKey: privateKey,
        prime: prime
    };

    if(entity) {
        fs.writeFile('lib/keys/' + entity+ '.json', JSON.stringify(keys, null, 4), function (err) {
            if (err) throw err;
            callback(keys);
        });
    } else {
        callback(keys);
    }
};

exports.createSharedSecret = createSharedSecret = function(entity1, entity2, callback) {

   if(!entity1 || !entity2) {
       throw new Error("'entity1' and 'entity2' are required");
   }

    var entity1KeyPair = require('./../keys/' + entity1 + '.json');
    var entity1PublicKey = entity1KeyPair.publicKey;
    var entity1PrivateKey = entity1KeyPair.privateKey;

    var dh = crypto.createDiffieHellman(entity1KeyPair.prime,'base64');
    dh.setPublicKey(entity1PublicKey);
    dh.setPrivateKey(entity1PrivateKey);

    var entity2PublicKey = require('./../keys/' +  entity2 + '.json').publicKey;

    var sharedSecret = {
        secret:dh.computeSecret(entity2PublicKey, 'base64', 'base64').toString()
    };

    fs.writeFile('lib/keys/' + entity1 + '_' + entity2 + '_secret.json', JSON.stringify(sharedSecret, null, 4), function (err) {
        if (err) throw err;
        callback(sharedSecret);
    });
};