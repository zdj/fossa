var dashboard = require('../lib/services/ui/dashboard');

exports.index = function (req, res) {
    dashboard.dashboard(req,res);
};
