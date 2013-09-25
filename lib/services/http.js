
var get = function(req, res, cb, params){
    var statusCode = params[0];
    var responseMessage = params[1];
    cb(req,res,responseMessage, statusCode);
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;