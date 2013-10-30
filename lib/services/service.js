exports.get = function(req, res, params, cb) {
    cb(req, res, params.method + ' ' + params.path, 200);
};