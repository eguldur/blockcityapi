var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  googleUserId : String,
  googleUserName : String, 
  googleEmail : String,
  userName : String,
  changeUserName : Boolean,
  coin : Number,
  numberOfWins : Number,
  numberOfDefeats : Number
  //score array
  //match array
});


module.exports = mongoose.model("User", userSchema);
