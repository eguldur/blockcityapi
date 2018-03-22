var mongoose = require("mongoose");

var queueSchema = new mongoose.Schema({
    userName : String,
    addTime : Date
});

module.exports = mongoose.model("Queue", queueSchema);