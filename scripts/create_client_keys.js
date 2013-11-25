#!/usr/bin/env node

var apiKeyUtils = require('api_key_utils');
require('colors');

var runScript = function(name,callback) {
    if(name) {
        apiKeyUtils.createKeys(name,function(keys) {
            callback(keys);
        });
    } else {
        callback('name required: '.red + 'createClientKeys.js [name]'.italic);
    }
};

exports.runScript = runScript;

runScript(process.argv[2],function(keys) {
    console.log(keys);
});


