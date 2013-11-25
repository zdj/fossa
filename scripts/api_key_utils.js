var colors = require('colors');
var crypto = require('crypto');
var fs = require('fs');

exports.createPrime = function(callback) {
    var keyExchange = crypto.createDiffieHellman(256,'base64');
    var prime = JSON.stringify({
        prime:keyExchange.getPrime('base64')
    },null,4);
    fs.writeFile('lib/security/prime.json', prime);
    if(callback) {
        callback(prime);
    }
};

var getPrime = function(callback) {
    fs.readFile('lib/security/prime.json', function (err, data) {
        if (err) throw err;
        callback(JSON.parse(data.toString()).prime);
    });
};

exports.getPrime = getPrime;

exports.createKeys = function(name,callback) {
    getPrime(function(prime) {
        var keyExchange = crypto.createDiffieHellman(prime,'base64');
        var publicKey = keyExchange.generateKeys('base64');
        var privateKey = keyExchange.getPrivateKey('base64');
        var keys = JSON.stringify({
            publicKey: publicKey,
            privateKey:privateKey
        },null,4);
        fs.writeFile('lib/security/'+name+'_keys.json', keys);
        if(callback) {
            callback(keys);
        }
    });
};

var getKeys = function(name,callback) {
    fs.readFile('lib/security/' + name + '_keys.json', function (err, data) {
        if (err) throw err;
        var keys = JSON.parse(data.toString());
        callback(keys.publicKey,keys.privateKey);
    });
};

exports.getKeys = getKeys;

exports.createSecret = function(name,callback) {
    getPrime(function(prime) {
        getKeys('api', function(apiPubKey,apiPriKey) {
            getKeys(name, function(clientPubKey) {
                var keyExchange = crypto.createDiffieHellman(prime,'base64');
                keyExchange.setPublicKey(apiPubKey);
                keyExchange.setPrivateKey(apiPriKey);
                var secret = JSON.stringify({
                    secret: keyExchange.computeSecret(clientPubKey,'base64','base64').toString()
                },null,4);
                fs.writeFile('lib/security/secret.json', secret);
                if(callback) {
                    callback(secret);
                }
            });
        });
    });
};
