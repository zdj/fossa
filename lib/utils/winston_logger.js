var winston = require('winston');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {'timestamp':true,'colorize':true});

exports.winston = winston;