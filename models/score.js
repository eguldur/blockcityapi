var mongoose = require("mongoose");

var scoreSchema = new mongoose.Schema({
    userName : String,
    timeMode : {type: Number, default:0},
    classicMode : {type: Number, default:0}
}, {timestamps : true});

module.exports = mongoose.model("Score", scoreSchema);