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

    var keyAgreement = {

        entity1: entity1Name,
        entity2: entity2Name,
        entity1PublicKey: entity1PublicKey,
        entity1PrivateKey: entity1PrivateKey,
        entity2PublicKey: entity2PublicKey,
        entity2PrivateKey: entity2PrivateKey,
        secret: secret,
        prime: prime
    };

    fs.writeFile('lib/keys/' + entity1Name + '_' + entity2Name + '_keyAgreement.json', JSON.stringify(keyAgreement, null, 4), function (err) {
        if (err) throw err;
        callback(keyAgreement);
    });
};

exports.getKeyAgreement = getKeyAgreement = function(entity1Name, entity2PublicKey, callback) {
    var keyAgreement = null;

    glob("lib/keys/*.json", {}, function (er, files) {
        async.each(files, function (file, cb) {
            var _keyAgreement = require('../../' + file);

            console.log("\nSnitch ass! \n");
            console.log(_keyAgreement);

            if (entity2PublicKey == _keyAgreement.entity2PublicKey && _keyAgreement.entity1 == entity1Name) {
                keyAgreement = _keyAgreement;
            }
            cb();
        }, function (err) {
            if (err) throw err;
            callback(keyAgreement);
        });
    });
};

exports.performAuthCheck = performAuthCheck = function (req, res, params, method, serverName, cb) {

    var authHeader = req.header('Authorization');

    function doAuthCheck() {
        var apiKey = authHeader.substring(apiKeyName.length).split(':');
        if (apiKey.length != 2) {
            notAuthorized(req, res, cb);
        } else {
            var entity2PublicKey = apiKey[0];
            var sentHash = apiKey[1];

            getKeyAgreement(serverName, entity2PublicKey, function (keyAgreement) {

                if (!keyAgreement) {
                    notAuthorized(req, res, cb);
                } else {

                    var canonicalizedHeaders = getCanonicalizedHeaders(req.headers);
                    var canonicalizedResource = getCanonizalizedResource(req.url);
                    var httpMethod = req.method;
                    var data = req.rawBody;

                    var computedHash = createHmacHash(data, httpMethod, canonicalizedHeaders, canonicalizedResource, keyAgreement);
                    if (computedHash != sentHash) {
                        notAuthorized(req, res, cb);
                    } else {
                        method(req, res, params, cb);
                    }
                }
            });
        }
    }

    if (!authHeader) {
        notAuthorized(req, res, cb);
    } else {
        var apiKeyName = params['apiKey'] + ' ';
        if (authHeader.indexOf(apiKeyName) != 0) {
            notAuthorized(req, res, cb);
        } else {
            doAuthCheck();
        }
    }
};

function notAuthorized(req, res, cb) {
    cb(req, res, "Not authorized", 401);
}

exports.createHmacHash = createHmacHash = function (data, method, canonicalizedHeaders, canonicalizedResource, keyAgreement) {
    var stringToSign = method + '\n' + createMd5Hash(data) + '\n' + canonicalizedHeaders + canonicalizedResource;
    return signString(stringToSign, keyAgreement);
};

function signString(stringToSign, keyAgreement) {
    var hmacHash = crypto.createHmac('sha256', new Buffer(keyAgreement.secret));
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
        return url;
    }
};