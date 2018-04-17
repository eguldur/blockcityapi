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
  friends: [{userId : String, userName : String}],                 //martchtpe
  waiting: [{
    googleUserId : String,
    userName : String, 
    matchId : String, 
    matchType: String,
    accepted: {type : Number, default: 0}, 
    addTime : { type : Date, default: Date.now }}],
  finished : [{
    userName: String, 
    userId : String,
    matchId : String, 
    myScore: Number, 
    enemyScore : Number, 
    matchStatus : String, 
    matchType: String, 
    addTime : { type : Date, default: Date.now }}],
  sentMatches : [{
    googleUserId : String,
    userName: String, 
    matchId : String, 
    myScore: Number, 
    matchType: String, 
    addTime : { type : Date, default: Date.now }}]
});


module.exports = mongoose.model("User", userSchema);
