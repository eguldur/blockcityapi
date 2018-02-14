var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  userId : String,
  userName : String,
  email : String,
  score : String
});

module.exports = mongoose.model("User", userSchema);
