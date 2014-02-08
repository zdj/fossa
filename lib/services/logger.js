require('colors');

var get = function(req, res, params, cb) {	
    console.log(JSON.stringify({
        "Request": {
            "Date": new Date(),
            "URL": req.url,
            "Method": req.method,
            "Body": req.rawBody,
            "Headers": req.headers
        }
    }).grey);
    cb(req, res, 204);
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;
