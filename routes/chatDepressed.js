var models = require("../models");
exports.view = function(req, res) {
    models.Newsfeed.find({type: 'depressed'}).sort('-posted').exec(displayPosts);

    function displayPosts(err, posts) {
        if(err) {
            console.log(err);
            res.send(500);
            return;
        }
        res.render('chatDepressed', {'depressed': posts});
    }
};
