var mongoose = require("mongoose");

var scoreSchema = new mongoose.Schema({
    googleUserId : String,
    userName : String,
    timeMode : {type: Number, default:0},
    classicMode : {type: Number, default:0}
}, {timestamps : true});

module.exports = mongoose.model("Score", scoreSchema);