var mongoose = require("mongoose");

var matchSchema = new mongoose.Schema({
    userName1 : String,
    userName2 : String,
    matchStatu : Boolean,
    score1 : Number,
    score2 : Number,
    addTime : Date
});

module.exports = mongoose.model("Match", matchSchema);