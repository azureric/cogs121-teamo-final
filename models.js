var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    "twitterID": String,
    "token": String,
    "username": String,
    "displayName": String,
    "photo": String
});

var NewsfeedSchema = new mongoose.Schema({
    "type": String,
    "user": String,
    "photo": String,
    "message": String,
    "posted": Date,
    "uniqueURL": String
});

exports.User = mongoose.model("User", UserSchema);
exports.Newsfeed = mongoose.model("Newsfeed", NewsfeedSchema);