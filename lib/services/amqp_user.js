var colors = require('colors');
var exec = require('child_process').exec;

exports.put = function(req, res, cb, params) {

	var ampq = 'curl -i -u ' + params['user'] + ' -H "content-type:application/json" -XPUT -d \'{"password":"' + params['password'] + '","tags":"' + params['tag'] + '"}\' http://' + params['host'] + ':' + params['port'] + '/api/users/' + params['username'];

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
