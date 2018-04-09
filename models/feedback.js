var mongoose = require("mongoose");

var feedbackSchema = new mongoose.Schema({
    userName : String,
    messages : String
}, {timestamps: true});

module.exports = mongoose.model("Feedback", feedbackSchema);