var colors = require('colors');
var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var glob = require("glob");

exports.createDHKeys = createKeys = function (callback,name) {

    var dh = crypto.getDiffieHellman('modp5');
    var publicKey = dh.generateKeys('base64');
    var privateKey = dh.getPrivateKey('base64');

    var keys = {
        publicKey: publicKey,
        privateKey: privateKey
    };

    if(name) {
        fs.writeFile('lib/keys/' + name+ '.json', JSON.stringify(keys), function (err) {
            if (err) throw err;
            callback(keys);
        });
    } else {
        callback(keys);
    }
};