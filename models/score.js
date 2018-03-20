var mongoose = require("mongoose");

var scoreSchema = new mongoose.Schema({
    userName : String,
    timeMode : String,
    classicMode : String,
    //addTime : Date
});

module.exports = mongoose.model("Score", scoreSchema);