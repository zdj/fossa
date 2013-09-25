
var get = function(req, res, cb, params){
    res.redirect(params[0]);
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;