/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var conf = require('./lib/config.json');
var colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

var app = express();

function anyBodyParser(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', function() {
        req.rawBody = data;
        next();
    });
}


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(anyBodyParser);
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var server = http.createServer(app);

app.get('/', routes.index);

conf['services'].forEach(function (service) {
    console.log(('Creating service listener: ' + service['name']).info);
    var type = service['type'].toUpperCase();
    console.log('\t' + ('Type: ' + type.toUpperCase()).verbose);
    var path = service['path'];
    console.log('\t' + ('Path: ' + path).verbose);
    var responseType = service['response']['type'].toLowerCase();
    console.log('\t' + ('Response Type: ' + responseType).verbose);
    console.log();

    function sendResponse(req, res, data) {
        res.setHeader('Content-Type', req.header("Content-Type"));
        res.setHeader('Content-Length', data.length);
        res.send(data);
    }

    if (type == 'GET') {
	    var response = require('./lib/responses/' + responseType).get;
        app.get(path, function (req, res) {
            response(req,res,sendResponse);
        });
    } else if (type == 'POST') {
	    response = require('./lib/responses/' + responseType).post;
        app.post(path, function (req, res) {
            response(req,res,sendResponse);
        });
    }
});
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
