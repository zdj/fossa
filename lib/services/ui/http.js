var fs = require('fs');

exports.buildJadeContext = function buildJadeContext(httpService, cb) {

    var jadeContextService = {
        path: httpService.path,
        type: 'http',
        method: httpService.method,
        params: JSON.stringify(httpService.params),
        status: '',
        contentType: '',
        response: ''
    };

    var params = httpService.params;

    if (params) {

        var statusCode = params.statusCode;
        if (statusCode) {
            jadeContextService.status = statusCode;
        }

        var headers = params.headers;
        if (headers) {
            var contentType = headers['Content-Type'];
            if (contentType) {
                jadeContextService.contentType = contentType;
            }
        }

        var response = params.response;
        if (response) {
            jadeContextService.response = JSON.stringify(response);
            cb(null, jadeContextService);
        } else if (params.file) {
            fs.readFile('./lib/files/' + params.file, function(err, data) {
                if (err) {
                    cb(err, null);
                } else {
                    jadeContextService.response = data;
                    cb(null, jadeContextService);
                }
            });
        } else {
            cb(null, jadeContextService);
        }
    } else {
        cb(null, jadeContextService);
    }
}
