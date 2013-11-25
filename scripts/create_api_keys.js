#!/usr/bin/env node

var apiKeyUtils = require('api_key_utils');

var runScript = function(callback) {
    apiKeyUtils.createKeys('api',function(keys) {
        callback(keys);
    });
};

exports.runScript = runScript;

runScript(function(keys) {
    console.log(keys);
});