#!/usr/bin/env node

var colors = require('colors');
var crypto = require('crypto');
var fs = require('fs');

exports.createPrime = function(callback) {
    var keyExchange = crypto.createDiffieHellman(256,'hex');
    var prime = JSON.stringify({
        prime:keyExchange.getPrime('hex')
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
        var keyExchange = crypto.createDiffieHellman(prime,'hex');
        var publicKey = keyExchange.generateKeys('hex');
        var privateKey = keyExchange.getPrivateKey('hex');
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
                var keyExchange = crypto.createDiffieHellman(prime,'hex');
                keyExchange.setPublicKey(apiPubKey);
                keyExchange.setPrivateKey(apiPriKey);
                var secret = JSON.stringify({
                    secret: keyExchange.computeSecret(clientPubKey,'hex','hex').toString()
                },null,4);
                fs.writeFile('lib/security/secret.json', secret);
                if(callback) {
                    callback(secret);
                }
            });
        });
    });
};
