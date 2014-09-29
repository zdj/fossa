require('colors');
var fs = require('fs');
var httpService = require('./http');

var logFile = process.env['HOME'] + "/.fossa/file_logger.log";

var get = function(req, res, params, cb) {

    var request = JSON.stringify({
        "Request": {
            "Date": new Date(),
            "URL": req.url,
            "Method": req.method,
            "Body": req.rawBody,
            "Headers": req.headers
        }
    });

    fs.appendFileSync(logFile, request);

    httpService.get(req, res, params, cb);
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;
