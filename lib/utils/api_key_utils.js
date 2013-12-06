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
    var keyExchange = crypto.createDiffieHellman(512, 'base64');
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

exports.performAuthCheck = performAuthCheck = function (req, res, params, method, cb) {

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
                var sentHash = apiKey[1];

                getKeyPair(sentPublicKey, function (publicKey, privateKey) {

                    if (!privateKey) {
                        notAuthorized(req, res, cb);
                    } else {

                        var canonicalizedHeaders = getCanonicalizedHeaders(req.headers);
                        var canonicalizedResource = getCanonizalizedResource(req.url);
                        var httpMethod = req.method;
                        var data = req.rawBody;

                        var computedHash = createHmacHash(data, httpMethod, req.headers, canonicalizedHeaders, canonicalizedResource);
                        if(computedHash!=sentHash) {
                            notAuthorized(req, res, cb);
                        } else {
                            method(req, res, params, cb);
                        }
                    }
                });
            }
        }
    }
};

exports.getKeyPair = getKeyPair = function (publicKey, cb) {

    var privateKey = null;

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
            cb(publicKey, privateKey);
        });
    });
};

exports.createHmacHash = createHmacHash = function (data, method, headers, canonicalizedHeaders, canonicalizedResource) {

    var contentTypeHeaderName = _.find(_.keys(headers), function (header) {
        return (header.toLowerCase() == 'content-type');
    });
    var contentType =  contentTypeHeaderName ? headers[contentTypeHeaderName] : "";

    var date = headers[_.find(_.keys(headers), function (header) {
        return (header.toLowerCase() == 'date');
    })];

    var stringToSign = method + '\n' + createMd5Hash(data) + '\n' + String(contentType).trim() + '\n' + String(date).trim() + '\n' + canonicalizedHeaders + canonicalizedResource;
    return signString(stringToSign);
};

function signString(stringToSign) {
    var hmacHash = crypto.createHmac('sha256', new Buffer(getSecret()));
    hmacHash.update(stringToSign);
    return hmacHash.digest('base64');
}

exports.createMd5Hash = createMd5Hash = function (data) {
    if (data) {
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(data);
        return md5Hash.digest('base64');
    } else {
        return "";
    }
};

exports.getCanonicalizedHeaders = getCanonicalizedHeaders = function (headers) {

    var headerNames = _.keys(headers);
    headerNames.sort();

    var canonicalizedHeaders = String();

    _.each(headerNames, function (headerName) {

        if (_.contains(['date', 'content-type', 'content-length'], headerName.toLowerCase())) {

            var headerValue = String(headers[headerName]);

            headerName = headerName.toLowerCase();
            headerValue = headerValue.replace('\n', ' ');
            headerValue = headerValue.replace('\r', ' ');
            headerValue = headerValue.trim();
            headerValue = headerValue + '\n';

            canonicalizedHeaders += (headerName + ':' + headerValue);
        }
    });

    return canonicalizedHeaders;
};

exports.getCanonizalizedResource = getCanonizalizedResource = function(url) {
    if (url.indexOf('?') > 0) {
        return url.substring(0, url.indexOf('?'));
    } else {
        return url
    }
};

function notAuthorized(req, res, cb) {
    cb(req, res, "Not authorized", 401);
}
