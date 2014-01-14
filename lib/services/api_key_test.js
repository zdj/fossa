var rest = require('restler');
var apiKeyUtils = require('../utils/api_key_utils');
var winston = require('../utils/winston_logger').winston;

var callRemoteService = function (req, res, params, cb) {

    var url = params['prefix'] + '://' + params['host'] + ':' + params['port'] + params['resource'];
    var method = params['method'];
    var data = JSON.stringify(params['data'], null, 4);

    var options = {
        timeout: params['timeout'],
        data: data,
        headers: {
            'Date': new Date().toDateString(),
            'Content-Type': params['contentType'],
            'Content-Length': data.length
        }
    };

    apiKeyUtils.getApiKeyHeaderValue(params['entityName'], params['key'], options['headers'], params['resource'], method, options['data'], function(apiKeyHeaderValue) {

        options['headers']['Authorization'] = apiKeyHeaderValue;

        if (method.toUpperCase() == 'GET') {
            get(req, res, cb, url, options);
        } else if (method.toUpperCase() == 'POST') {
            post(req, res, cb, url, options);
        } else if (method.toUpperCase() == 'DELETE') {
            _delete(req, res, cb, url, options);
        } else if (method.toUpperCase() == 'PUT') {
            put(req, res, cb, url, options);
        } else {
            res.set('Content-Type', 'text/plain');
            cb(req, res, "http method not supported", 500);
        }
    });
};

function waitForResponse(call, req, res, cb, url) {

    call.on('timeout',function (ms) {
        sendError(req, res, cb, 'attempt to connect to ${url} did not return within ' + ms + 'ms');
    }).on('error',function (data, response) {
        sendError(req, res, cb, 'error occurred when trying to connect to ' + url);
    }).on('complete', function (data, response) {
        res.set('Content-Type', response.headers['content-type']);
        cb(req, res, response.rawEncoded, response.statusCode);
    });
}

function get(req, res, cb, url, options) {
    waitForResponse(rest.get(url, options), req, res, cb, url);
}

function post(req, res, cb, url, options) {
    waitForResponse(rest.post(url, options), req, res, cb, url);
}

function put(req, res, cb, url, options) {
    waitForResponse(rest.put(url, options), req, res, cb, url);
}

function _delete(req, res, cb, url, options) {
    waitForResponse(rest.delete(url, options), req, res, cb, url);
}

function sendError(req, res, cb, errorMessage) {
    winston.error(errorMessage);
    res.set('Content-Type', 'text/plain');
    cb(req, res, errorMessage, 500);
}

exports.get = callRemoteService;
exports.post = callRemoteService;
exports.delete = callRemoteService;
exports.put = callRemoteService;
