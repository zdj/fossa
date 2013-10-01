
var get = function(req, res, params){
    var data = req.url;
    cb(req,res,data);
};

var post = function(req, res, params){
    data = req.rawBody;
    cb(req,res,data);
};

exports.get = get;
exports.post = post;
exports.delete = get;
exports.put = post;