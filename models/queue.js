var mongoose = require("mongoose");

var queueSchema = new mongoose.Schema({
    userName : String
});

module.exports = mongoose.model("Queue", queueSchema);