#!/usr/bin/env node

var apiKeyUtils = require('../lib/security/api_key_utils');
require('colors');

var name = process.argv[2];
if(name) {
    apiKeyUtils.createKeys(name,function(keys) {
        console.log(keys);
    });
} else {
    console.log('name required: '.red + 'createClientKeys.js [name]'.italic);
}
