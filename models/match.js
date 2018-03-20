var mongoose = require("mongoose");

var matchSchema = new mongoose.Schema({
    selfUserName : String,
    enemyUserName : String,
    matchStatu : Boolean,
    selfScore : String,
    enemyScore : String,
    addTime : Date
});

module.exports = mongoose.model("Match", matchSchema);