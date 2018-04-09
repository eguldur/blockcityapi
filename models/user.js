var mongoose = require("mongoose");
var ObjectId = mongoose.SchemaTypes.ObjectId;

var userSchema = new mongoose.Schema({
  googleUserId : String,
  googleUserName : {type: String, required: true, trim: true},
  googleEmail : String,
  userName : String,
  changeUserName : Boolean,
  coin : Number,
  numberOfWins : Number,
  numberOfDefeats : Number,
  //score array
  //match array
  friends: [{userName : String}],
  waiting: [{userName : String, matchId : String, addTime : { type : Date, default: Date.now }}],
  finished : [{userName: String, matchId : String, myScore: Number, enemyScore : Number, matchStatus : String, addTime : { type : Date, default: Date.now }}]
});


module.exports = mongoose.model("User", userSchema);
