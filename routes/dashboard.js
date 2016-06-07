var models = require("../models");
exports.view = function(req, res) {
    models.Newsfeed.find({type: 'anxietyChat'}).sort('posted').exec(displayPosts);

    function displayPosts(err, posts) {
        if (err) {
            console.log(err);
            res.send(500);
            return;
        }
        res.render('dashboardnew', {'messages': posts});
    }
};