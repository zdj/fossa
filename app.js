var npid = require('npid');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fossa = require('./lib/fossa');
var colors = require('colors');
var expressWinston = require('express-winston');
var winston = require('./lib/utils/winston_logger').winston;

try {
    npid.create(process.env.HOME + '/fossa.pid');
} catch (err) {
    console.log(err);
    process.exit(1);
}

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

app.use(expressWinston.logger({
    transports: [
        winston
    ]
}));

app.use(app.router);

app.use(expressWinston.errorLogger({
    transports: [
        winston
    ]
}));

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
	server.listen(app.settings.port, function () {
	    console.log('Fossa Dashboard is running at: ' + ('http://localhost:' + app.settings.port).yellow);
	});
});