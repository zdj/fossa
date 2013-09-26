var colors = require('colors');
var exec = require('child_process').exec;

exports.put = function(req, res, cb, params) {

	var amqpPublish = 'curl -i -u ' + params['user'] + ' -H "content-type:application/json" -XPUT http://' + params['host'] + ':' + params['port'] + '/api/vhosts/' + params['vhost'];

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
};
