var colors = require('colors');
var exec = require('child_process').exec;

exports.post = function(req, res, cb, params) {

	var ampq = 'curl -i -u '+params['user']+' -H "content-type:application/json" -XPOST -d \'{"routing_key":"'+params['routingKey']+'","arguments":[]}\' http://'+params['host']+':'+params['port']+'/api/bindings/'+params['vhost']+'/e/'+params['exchange']+'/q/'+params['queue'];
	
	console.log();
	console.log(('Exec: ' + ampq).grey);
	console.log();

	var curl = exec(ampq, function(error, stdout, stderr) {
		var responseStart = 'Response from Rabbit MQ was: \n\n';
		if (error !== null) {
			cb(req, res, responseStart + stderr, 500);
		} else {
			cb(req, res, responseStart + stdout, 200);
		}
	});
};