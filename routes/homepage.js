var models = require("../models");

exports.view = function(req, res) {

	try {
		var user = req.session.passport.user;
	} catch(err) {
		console.log("no user authenticated");
		return;
	}

	res.render('homepage', {'user': user.username});
};