var colors = require('colors');
var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var glob = require("glob");

exports.getPrime = getPrime = function () {
    return require('../security/prime.json').prime;
};

exports.getSecret = getSecret = function () {
    return require('../security/secret.json').secret;
};

exports.getApiPublicKey = getApiPublicKey = function () {
    return require('../security/api_keys.json').publicKey;
};

exports.getApiPrivateKey = getApiPrivateKey = function () {
    return require('../security/api_keys.json').privateKey;
};

exports.getPublicKey = getPublicKey = function (name) {
    return require('../security/' + name + '_keys.json').publicKey;
};

exports.getPrivateKey = getPrivateKey = function (name) {
    return require('../security/' + name + '_keys.json').privateKey;
};

exports.createPrime = function (callback) {
    var keyExchange = crypto.createDiffieHellman(256, 'base64');
    var _prime = {
        prime: keyExchange.getPrime('base64')
    };
    var prime = JSON.stringify(_prime, null, 4);
    fs.writeFile('lib/security/prime.json', prime, function (err) {
        if (err) throw err;
        if (callback) {
            callback(_prime);
        }
    });
};

exports.createKeys = function (name, callback) {
    var keyExchange = crypto.createDiffieHellman(getPrime(), 'base64');
    var publicKey = keyExchange.generateKeys('base64');
    var privateKey = keyExchange.getPrivateKey('base64');
    var _keys = {
        publicKey: publicKey,
        privateKey: privateKey
    };
    var keys = JSON.stringify(_keys, null, 4);
    fs.writeFile('lib/security/' + name + '_keys.json', keys, function (err) {
        if (err) throw err;
        if (callback) {
            callback(_keys);
        }
    });
};

exports.createSecret = function (name, callback) {
    var publicKey = getPublicKey(name);
    var keyExchange = crypto.createDiffieHellman(getPrime(), 'base64');
    keyExchange.setPublicKey(getApiPublicKey());
    keyExchange.setPrivateKey(getApiPrivateKey());
    var _secret = {
        secret: keyExchange.computeSecret(publicKey, 'base64', 'base64').toString()
    };
    var secret = JSON.stringify(_secret, null, 4);
    fs.writeFile('lib/security/secret.json', secret);
    if (callback) {
        callback(_secret);
    }
};

exports.performAuthCheck = function (req, res, params, cb, method) {
    var authHeader = req.header('Authorization');
    if (!authHeader) {
        notAuthorized(req, res, cb);
    } else {
        var apiKeyName = params['apiKey'] + ' ';
        if (authHeader.indexOf(apiKeyName) != 0) {
            notAuthorized(req, res, cb);
        } else {
            var apiKey = authHeader.substring(apiKeyName.length).split(':');
            if (apiKey.length != 2) {
                notAuthorized(req, res, cb);
            } else {
                var sentPublicKey = apiKey[0];
                var sentHmac = apiKey[1];

                getKeyPair(sentPublicKey, function(keys) {
                    if(!keys.privateKey) {
                        notAuthorized(req, res, cb);
                    }
                    method(req, res, params, cb);
                });
            }
        }
        // Authorization: api_key HUaD3iIUOVDL/opmfsUoncw2y4bn5ziYYPBOSc9FZFc=:9Ll9lhGRgKiGeQTSrDTcR4ya3hC9z25gDFyJb5AODe4=
    }
};

exports.getKeyPair = getKeyPair = function (publicKey, cb) {

    var privateKey;

    glob("lib/security/*.json", {}, function (er, files) {
        async.each(files, function (file, cb) {
            var keys = require('../../' + file);
            var _publicKey = keys.publicKey;
            if (publicKey == _publicKey) {
                privateKey = keys.privateKey;
            }
            cb();
        }, function (err) {
            if (err) throw err;
            if (privateKey) {
                cb(publicKey, privateKey);
            } else {
                cb(publicKey, null);
            }
        });
    });
};

exports.createHmacHash = function (data, method, headers, canonicalizedHeaders, canonicalizedResource) {

    var contentType = (headers['Content-Type']) ? headers['Content-Type'] : "";
    var stringToSign = method + '\n' + createMd5Hash(data) + '\n' + contentType + '\n' + headers['Date'] + '\n' + canonicalizedHeaders + '\n' + canonicalizedResource;
    return createHmacHash(stringToSign);
};

function createHmacHash(stringToSign) {
    var hmacHash = crypto.createHmac('sha256', new Buffer(getSecret()));
    hmacHash.update(stringToSign);
    return hmacHash.digest('base64');
}

function createMd5Hash(data) {
    if (data) {
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(data);
        return md5Hash.digest('base64');
    } else {
        return "";
    }
}

exports.getCanonicalizedResource = function (options) {
    return options.path;
};

exports.getCanonicalizeHeaders = function (headers) {

    var canonicalizedHeaders = String();
    var headerNames = _.keys(headers);

    headerNames.sort();

    _.each(headerNames, function (headerName) {

        var headerValue = String(headers[headerName]);

        headerName = headerName.toLowerCase();
        headerValue = headerValue.replace('\n', ' ');
        headerValue = headerValue.replace('\r', ' ');
        headerValue = headerValue.trim();
        headerValue = headerValue + '\n';

        canonicalizedHeaders += (headerName + ':' + headerValue);
    });

    return canonicalizedHeaders;
};

function notAuthorized(req, res, cb) {
    cb(req, res, "Not authorized", 401);
}
