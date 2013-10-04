/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fossa = require('./lib/fossa');

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

fossa.loadServices(app, function(serviceCount) {
	console.log(('Created ' + serviceCount + ' services using lib/config.json').yellow.bold);
	console.log();
	server.listen(app.get('port'), function () {
	    console.log('Express server listening on port ' + app.get('port'));
	});
});

