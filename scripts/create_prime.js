#!/usr/bin/env node

var apiKeyUtils = require('../lib/security/api_key_utils');

apiKeyUtils.createPrime(function(prime) {
    console.log(prime)
});