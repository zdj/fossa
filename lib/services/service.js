exports.get = function(req, res, params, cb) {
    
    var service = require('./' + params.type)
    
    if(params.method == 'GET') {        
        service.get(req, res, JSON.parse(params.params), cb);
    } else if(params.method == 'POST') {
        service.post(req, res, JSON.parse(params.params), cb);
    } else if(params.method == 'PUT') {
        service.put(req, res, JSON.parse(params.params), cb);
    } else if(params.method == 'DELETE') {
        service.delete(req, res, JSON.parse(params.params), cb);
    } else {        
        cb(req, res, 'Bad Request: Could not find route to ' + params.path + ' for method ' + params.method, 400);
    }   
};