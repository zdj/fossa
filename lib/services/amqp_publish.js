var colors = require('colors');
var exec = require('child_process').exec;

exports.post = function(req, res, cb, params) {
	
	var amqpPublish = 'curl -i -u '+params['user']+' -H "content-type:application/json" -XPOST -d \'{"properties":{},"routing_key":"'+params['routingKey']+'","payload":"'+params['payload']+'","payload_encoding":"'+params['payloadEncoding']+'"}\' http://'+params['host']+':'+params['port']+'/api/exchanges/'+params['vhost']+'/'+params['exchange']+'/publish';
	
	var curl = exec(amqpPublish, function (error, stdout, stderr) {
		var responseStart = 'Response from Rabbit MQ was: \n\n';
	    if (error !== null) {
		  	cb(req, res, responseStart + stderr, 500);
	    } else {
	    	cb(req, res, responseStart + stdout, 200);
	    }
	});
};