
var get = function(req, res, cb, params){
    cb(req,res,params['responseMessage'], params['statusCode']);
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;