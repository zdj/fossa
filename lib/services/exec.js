var exec = require('child_process').exec;

var get = function(req, res, params, cb) {

    exec(params['command'] + ' ' + params['args'], function (error, stdout, stderr) {
        if (error !== null) {
            cb(req, res, stderr, 500);
        } else {
            if(params['output']) {
                cb(req, res, stdout, 200);
            } else {
                cb(req, res, null, 200);
            }
        }
    });
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;
