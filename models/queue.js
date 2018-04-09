var mongoose = require("mongoose");

var queueSchema = new mongoose.Schema({
    matchId : String,
    userName : String,
    score : Number
}, {timestamps: true});

module.exports = mongoose.model("Queue", queueSchema);