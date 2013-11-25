#!/usr/bin/env node

var apiKeyUtils = require('../lib/security/api_key_utils');

apiKeyUtils.createSecret('api',function(secret) {
    console.log(secret)
});