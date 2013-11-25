#!/usr/bin/env node

var apiKeyUtils = require('../lib/security/api_key_utils');

apiKeyUtils.createKeys('api',function(keys) {
    console.log(keys);
});
