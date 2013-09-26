
var get = function(req, res, cb, params){
    res.redirect(params['url']);
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;