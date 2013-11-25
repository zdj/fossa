#!/usr/bin/env node

var apiKeyUtils = require('api_key_utils');

var runScript = function(callback) {
    apiKeyUtils.createSecret('api',function(secret) {
        callback(secret)
    });
};

exports.runScript = runScript;

runScript(function(secret) {
    console.log(secret);
});