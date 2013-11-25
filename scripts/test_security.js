#!/usr/bin/env node

var _ = require('underscore');
var http = require('http');
var crypto = require('crypto');

var data = getData();
var options = getOptions(data);

addAuthorizationHeader(options, data);
sendRequest(options, data);


function addAuthorizationHeader(options, data) {

    // Steps for performing HMAC REST security

    // 1. Create a canonicalized headers string
    var canonicalizedHeaders = canonicalizeHeaders(options.headers);

    // 2. Create a canonicalized resource string (use the resource path but not including the query string)
    var canonicalizedResource = options.path;

    // 3. Create a MD5 hash of the data being sent to the server
    var md5 = createMd5Hash(data);

    // 4. Create the string to sign for this request
    //StringToSign = HTTP-Verb + "\n" + Content-MD5 + "\n" + Content-Type + "\n" + Date + "\n" + CanonicalizedAmzHeaders + CanonicalizedResource
    var stringToSign = options.method + '\n' + md5 + '\n' + options.headers['Content-Type'] + '\n' + options.headers['Date'] + '\n' + canonicalizedHeaders + '\n' + canonicalizedResource;

    // 5. Sign the string with HMAC
    var hmac = createHmacHash(stringToSign);

    // 6. Add the Authorization header to the request headers
    options.headers['Authorization'] = 'syndication_api_key ' + require('../lib/security/client_keys.json')['publicKey'] + ':' + hmac;
}

function getData() {
    return JSON.stringify({
        message: 'Hello there!'
    });
}

function getOptions(data) {
    return {
        hostname: '127.0.0.1',
        port: 3000,
        path: '/logger',
        method: 'POST',
        auth: '',
        headers: {
            'My Amazing Header': 'Its really\namazing!? ',
            'Date': '     ' + new Date().toString(),
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };
}

function sendRequest(options, data) {
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response body: ' + chunk);
        });
    });
    req.on('error', function (e) {
        console.log('Problem with request: '.red + e.message);
    });
    req.write(data);
    req.end();
}

function canonicalizeHeaders(headers) {

    var canonicalizedHeaders = String();
    var headerNames = _.keys(headers);

    // Sort the headers by key name
    headerNames.sort();

    _.each(headerNames, function (headerName) {

        var headerValue = String(headers[headerName]);

        // Convert the header name to lower case
        headerName = headerName.toLowerCase();
        // Replace any newline characters in the header value with a single space
        headerValue = headerValue.replace('\n', ' ');
        // Replace any carriage returns characters in the header value with a single space
        headerValue = headerValue.replace('\r', ' ');
        // Trim any whitespace from the header value
        headerValue = headerValue.trim();
        // Append a newline character to the end of the headerValue
        headerValue = headerValue + '\n';

        // Concatenate all the headers into a single string
        canonicalizedHeaders += (headerName + ':' + headerValue);
    });

    return canonicalizedHeaders;
}

function createHmacHash(stringToSign) {
    var hmacHash = crypto.createHmac('sha256', new Buffer(require('../lib/security/secret.json')['secret']));
    hmacHash.update(stringToSign);
    return hmacHash.digest('base64');
}

function createMd5Hash(data) {
    var md5Hash = crypto.createHash('md5');
    md5Hash.update(data);
    return md5Hash.digest('base64');
}