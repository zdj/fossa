var colors = require('colors');
var exec = require('child_process').exec;
var fs = require('fs');

exports.post = function(req, res, cb, params) {

	var payload = '';
	if(params['payload']) {
		payload = JSON.stringify(params['payload'])
	} else if(params['file']){
		fs.readFile('./lib/files/' + params['file'], function (err, data) {
			if (err) {
				cb(req, res, err.toString(), 500);
			} else {
				payload = data;
				
				var amqpPublish = 'curl -i -u ' + params['user'] + ' -H "content-type:application/json" -XPOST -d \'{"properties":{},"routing_key":"' + params['routingKey'] + '","payload":"' + payload + '","payload_encoding":"' + params['payloadEncoding'] + '"}\' http://' + params['host'] + ':' + params['port'] + '/api/exchanges/' + params['vhost'] + '/' + params['exchange'] + '/publish';
	
				console.log();
				console.log(('Exec: ' + amqpPublish).grey);
				console.log();
				
				var curl = exec(amqpPublish, function(error, stdout, stderr) {
					var responseStart = 'Response from Rabbit MQ was: \n\n';
					if (error !== null) {
						cb(req, res, responseStart + stderr, 500);
					} else {
						cb(req, res, responseStart + stdout, 200);
					}
				});
				
			}
		});
	}	
};
