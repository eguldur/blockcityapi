var mongoose = require("mongoose");

var matchSchema = new mongoose.Schema({
    matchId : String,
    userName1 : String,
    userName2 : String,
    matchStatu : Boolean,
    score1 : Number,
    score2 : Number
}, {timestamps : true});

module.exports = mongoose.model("Match", matchSchema);