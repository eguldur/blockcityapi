var mongoose = require("mongoose");

var feedbackSchema = new mongoose.Schema({
    googleUserId : String,
    userName : String,
    messages : String
}, {timestamps: true});

module.exports = mongoose.model("Feedback", feedbackSchema);