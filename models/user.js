var mongoose = require("mongoose");
var ObjectId = mongoose.SchemaTypes.ObjectId;

var userSchema = new mongoose.Schema({
  googleUserId : String,
  googleUserName : {type: String, required: true, trim: true},
  googleEmail : String,
  userName : String,
  changeUserName : Boolean,
  coin : Number,
  avatarId : {type: Number, default : 0},
  arenaId : {type: Number, default : 0},
  blockId : {type: Number, default : 0},
  numberOfWins : Number,
  numberOfDefeats : Number,
  timeMode :{type:Number, default:0},
  classicMode :{type:Number, default:0},
  //score array
  //match array
  friends: [{
    accepted : {type : Boolean, default : false},
    avatarId : Number,
    userId : String, 
    userName : String,
    addTime : { type : Date, default: Date.now }}],    

  waiting: [{
    avatarId : Number,
    googleUserId : String,
    userName : String, 
    matchId : String, 
    matchType: String,
    accepted: {type : Number, default: 0}, 
    addTime : { type : Date, default: Date.now }}],

  finished : [{
    avatarId : Number,
    userName: String, 
    userId : String,
    matchId : String, 
    myScore: Number, 
    enemyScore : Number, 
    matchStatus : String, 
    matchType: String, 
    addTime : { type : Date, default: Date.now }}],

  sentMatches : [{
    avatarId : Number,
    googleUserId : String,
    userName: String, 
    matchId : String, 
    myScore: Number, 
    matchType: String, 
    addTime : { type : Date, default: Date.now }}]
}, {timestamps : true});


module.exports = mongoose.model("User", userSchema);
/*id : {
  type: mongoose.Schema.Types.ObjectId,
  ref : "User"
}
*/