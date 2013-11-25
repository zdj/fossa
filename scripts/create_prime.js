#!/usr/bin/env node

var apiKeyUtils = require('api_key_utils');

var runScript = function(callback) {
    apiKeyUtils.createPrime(function(prime) {
        callback(prime);
    });
};

exports.runScript = runScript;

runScript(function(prime) {
    console.log(prime);
});
