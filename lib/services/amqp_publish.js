var colors = require('colors');
var exec = require('child_process').exec;
var fs = require('fs');

var get = function(req, res, params, cb) {
    
    function publish(payload) {
		var ampq = 'curl -i -u ' + params['user'] + ' -H "content-type:application/json" -XPOST -d \'{"properties":{},"routing_key":"' + params['routingKey'] + '","payload":"' + payload + '","payload_encoding":"' + params['payloadEncoding'] + '"}\' http://' + params['host'] + ':' + params['port'] + '/api/exchanges/' + params['vhost'] + '/' + params['exchange'] + '/publish';

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
    }
    
	if(params['payload']) {
		publish(params['payload']);
	} else if(params['file']){
		fs.readFile('./lib/files/' + params['file'], function (err, data) {
			if (err) {
				cb(req, res, err.toString(), 500);
			} else {
				publish(data);
			}
		});
	}	
};

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;
