var winston = require('winston');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {'timestamp':true,'colorize':true,'level':'info'});

exports.winston = winston;