var amqp = require('amqp');

exports.post = function(req, res, cb, params){
	
	var connection = amqp.createConnection({ host: params[0] });
	connection.on('ready', function(){
		
		var exchange = app.rabbitMqConnection.exchange(params[1]);
		
		console.log('Connected to amqp on ' + params[0])
	});
	
	cb(res,res);
};