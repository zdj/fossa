
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var conf = require('./conf/config.json');
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

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app);

app.get('/', routes.index);

conf['services'].forEach(function(service) {
    console.log(('Creating service listener: ' + service['name']).info);
    var type = service['type'].toUpperCase();
    console.log('\t' + ('Type: ' + type.toUpperCase()).verbose);
    var path = service['path'];
    console.log('\t' + ('Path: ' + path).verbose);
    var responseType = service['response']['type'].toLowerCase();
    console.log('\t' + ('Response Type: ' + responseType).verbose);
    console.log();

    function sendResponse(req,res,data) {
        res.setHeader('Content-Type', req.contentType);
        res.setHeader('Content-Length', data.length);
        res.send(data);
    }

    if(type == 'GET') {
        if(responseType == 'echo') {
            app.get(path, function(req, res){
                var data = req.url;
                sendResponse(req,res,data);
            });
        }
    } else if(type == 'POST') {
        if(responseType == 'echo') {
            app.post(path, function(req, res){
                var data = req.body;
                sendResponse(req,res,data);
            });
        }
    }
});
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
