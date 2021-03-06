var colors = require('colors');
var exec = require('child_process').exec;

var get = function(req, res, params, cb) {

	var ampq = 'curl -i -u ' + params.user + ' -H "content-type:application/json" -XPUT -d \'{"configure":".*","write":".*","read":".*","configure":".*"}\' http://' + params.host + ':' + params.port + '/api/permissions/' + params.vhost + '/' + params.username;

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

exports.get = get;
exports.post = get;
exports.delete = get;
exports.put = get;
