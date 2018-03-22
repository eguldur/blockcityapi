var mongoose = require("mongoose");

var scoreSchema = new mongoose.Schema({
    userName : String,
    timeMode : Number,
    classicMode : Number,
    addTime : Date
});

module.exports = mongoose.model("Score", scoreSchema);