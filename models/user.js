var mongoose = require("mongoose");
var findOneOrCreate = require('mongoose-find-one-or-create');

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
