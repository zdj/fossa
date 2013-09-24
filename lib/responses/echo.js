
exports.get = function(req, res, cb){
    var data = req.url;
    cb(req,res,data);
};

exports.post = function(req, res, cb){
    data = req.rawBody;
    cb(req,res,data);
};