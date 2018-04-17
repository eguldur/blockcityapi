var mongoose = require("mongoose");

var matchSchema = new mongoose.Schema({
    userName1 : String,
    userName2 : String,
    userId1 : String,
    userId2 : String,
    matchType : String,
    score1 : Number,
    score2 : Number
}, {timestamps : true});

module.exports = mongoose.model("Match", matchSchema);