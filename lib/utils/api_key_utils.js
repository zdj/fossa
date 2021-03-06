var _ = require('underscore');
var crypto = require('crypto');
var fs = require('fs');
var winston = require('../utils/winston_logger').winston;

exports.createKeyAgreement = function (callback) {

    var entity1 = crypto.createDiffieHellman(512);
    var entity1PublicKey = entity1.generateKeys('base64');
    var entity1PrivateKey = entity1.getPrivateKey('base64');

    var prime = entity1.getPrime('base64');
    var generator = entity1.getGenerator('base64');

    var entity2 = crypto.createDiffieHellman(entity1.getPrime(), 512);
    var entity2PublicKey = entity2.generateKeys('base64');
    var entity2PrivateKey = entity2.getPrivateKey('base64');

    var secret = entity1.computeSecret(entity2PublicKey, 'base64', 'base64');

    var keyAgreement = {

        entity1: 'server',
        entity2: 'client',
        entity1PublicKey: entity1PublicKey,
        entity1PrivateKey: entity1PrivateKey,
        entity2PublicKey: entity2PublicKey,
        entity2PrivateKey: entity2PrivateKey,
        secret: secret,
        generator: generator,
        prime: prime
    };

    fs.writeFile('lib/keys/server_client_keyAgreement.json', JSON.stringify(keyAgreement, null, 4), function (err) {
        if (err) throw err;
        callback(keyAgreement);
    });
};

exports.getKeyAgreement = getKeyAgreement = function (keyOrEntityName, callback) {

    fs.readFile('lib/keys/server_client_keyAgreement.json', function (err, data) {

        if (err) {
            winston.error(err.toString());
            callback();
        } else {
            var keyAgreement = JSON.parse(data);
            if (keyOrEntityName == keyAgreement.entity2PublicKey || keyOrEntityName == keyAgreement.entity2) {
                callback(keyAgreement);
            } else {
                callback();
            }
        }
    });
};

exports.getApiKeyHeaderValue = getApiKeyHeaderValue =  function getApiKeyHeader(entityName, keyName, headers, resource, method, data, cb) {

    getKeyAgreement(entityName, function(keyAgreement) {

        var computedHash = computeHash({
            headers: headers,
            url: resource,
            method: method,
            rawBody: data
        }, keyAgreement);

        cb(keyName + ' ' + keyAgreement.entity2PublicKey + ':' + computedHash);
    });
}

function computeHash(req, keyAgreement) {

    var canonicalizedHeaders = getCanonicalizedHeaders(req.headers);
    var canonicalizedResource = getCanonicalizedResource(req.url);
    var httpMethod = req.method;
    var hashedData = createMd5Hash(req.rawBody);

    return createHmacHash(hashedData, httpMethod, canonicalizedHeaders, canonicalizedResource, keyAgreement);
}

exports.performAuthCheck = performAuthCheck = function (req, res, params, method, cb) {

    var authHeader = req.header('Authorization');

    function doAuthCheck() {
        var apiKey = authHeader.substring(apiKeyName.length).split(':');
        winston.info(("the api key was '" + authHeader + "'"));
        if (apiKey.length != 2) {
            winston.error('the api key is malformed');
            notAuthorized(req, res, cb);
        } else {

            var entity2PublicKey = apiKey[0];
            var sentHash = apiKey[1];

            getKeyAgreement(entity2PublicKey, function (keyAgreement) {

                if (!keyAgreement) {
                    winston.error('the api key did not match the key agreement');
                    notAuthorized(req, res, cb);
                } else {
                    var computedHash = computeHash(req, keyAgreement);
                    if (computedHash != sentHash) {
                        winston.error("the api key's hash did not match the computed hash");
                        notAuthorized(req, res, cb);
                    } else {
                        method(req, res, params, cb);
                    }
                }
            });
        }
    }

    if (!authHeader) {
        winston.error('the authorization header was missing from the request');
        notAuthorized(req, res, cb);
    } else {
        var apiKeyName = params['apiKey'] + ' ';
        if (authHeader.indexOf(apiKeyName) != 0) {
            winston.error('the api key name is not correct');
            notAuthorized(req, res, cb);
        } else {
            doAuthCheck();
        }
    }
};

function notAuthorized(req, res, cb) {
    res.set('Content-Type', 'application/json');
    cb(req, res, JSON.stringify({error:"Not authorized"},null,4), 401);
}

exports.createHmacHash = createHmacHash = function (hashedData, method, canonicalizedHeaders, canonicalizedResource, keyAgreement) {
    var stringToSign = method + '\n' +  hashedData + '\n' + canonicalizedHeaders + canonicalizedResource;
    winston.debug("The string to sign is: " + stringToSign);
    var computedHash = signString(stringToSign, keyAgreement);
    winston.debug("The computed hash is: " + computedHash);
    return  computedHash;
};

function signString(stringToSign, keyAgreement) {
    var hmacHash = crypto.createHmac('md5', keyAgreement.secret);
    hmacHash.update(stringToSign);
    return hmacHash.digest('base64');
}

exports.createMd5Hash = createMd5Hash = function (data) {
    if (data) {
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(data);
        return md5Hash.digest('hex');
    } else {
        return "";
    }
};

exports.getCanonicalizedHeaders = getCanonicalizedHeaders = function (headers) {

    var headerNames = _.keys(headers);

    var canonicalizedHeaders = [];

    _.each(headerNames, function (headerName) {

        if (_.contains(['date', 'content-type', 'content-length'], headerName.toLowerCase())) {

            var headerValue = String(headers[headerName]);

            headerName = headerName.toLowerCase();
            headerValue = headerValue.replace('\n', ' ');
            headerValue = headerValue.replace('\r', ' ');
            headerValue = headerValue.trim();
            headerValue = headerValue + '\n';

            canonicalizedHeaders.push(headerName + ':' + headerValue);
        }
    })

    return canonicalizedHeaders.sort().reverse().join('');
};

exports.getCanonizalizedResource = getCanonicalizedResource = function (url) {

    if (url.indexOf('?') > 0) {
        return url.substring(0, url.indexOf('?'));
    } else {
        return url;
    }
};