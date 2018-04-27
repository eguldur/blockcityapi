var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose").set('debug', true);
var User = require("./models/user");
var Score = require("./models/score");
var Match = require("./models/match");
var Queue = require("./models/queue");
var Feedback = require("./models/feedback");
var moment = require('moment');
var async = require('async')
const jwt = require('jsonwebtoken');


// Config
const config = require('./config');
app.set('api_secret_key', config.api_secret_key);

// Middleware
const verifyToken = require('./middleware/verify-token');

//mongoose.connect("mongodb://localhost/blockcity", {useMongoClient: true});
mongoose.connect('mongodb://m.aslann35:006f9c60@ds233748.mlab.com:33748/mydb')
    .then(()=> { console.log(`Succesfully Connected to the Mongodb Database`)})
    .catch(()=> { console.log(`Error Connecting to the Mongodb Database`)});

app.use(bodyParser.urlencoded({extended:true}));

app.use('/api', verifyToken);

function intervalFunc(){
 Match.find({}, function(err, matches){
  matches.forEach(function(match){

    //console.log(moment.parseZone(match.updatedAt).format("YYYYMMDD HH:mm") , match.updatedAt, moment().zone(3).format("YYYYMMDD HH:mm"), moment().add(1,'days').format("YYYYMMDDHHmm"));
    if(match.matchStatus == false){
      var dateNow = moment().format("YYYYMMDDHHmm");
      var oneDayAfter = moment.parseZone(match.updatedAt).add(1,'minutes').format("YYYYMMDDHHmm");
  
      if(oneDayAfter <= dateNow){
        var matchId = match._id;
        var meydanOkuyanId = match.userId1;
        var meydanOkunanId = match.userId2;
        var meydanOkuyanUserName = match.userName1;
        var meydanOkunanUserName = match.userName2;
        var meydanOkuyanScore = match.score1;
        var meydanOkunanScore = match.score2;
  
        if(meydanOkunanScore == -1 && meydanOkuyanScore != -1){
          //meydan okuyan sent maci sil
          //meydan okuyana parasini iade et
          User.findOne({'googleUserId' : meydanOkuyanId}, function(err, user){
            console.log(dateNow, oneDayAfter);
            console.log(match.matchStatus, matchId, meydanOkuyanUserName, meydanOkunanUserName);
            user.coin += 1000;
            user.save();
           
             //gonderilen maci sil
             User.update({'googleUserId' : meydanOkuyanId}, {$pull: {'sentMatches': {matchId : matchId}}}, function(err, data){
              if(err){
                console.log(err);
              }
              if(data){
                match.matchStatus = true;
                match.save();
                console.log("sent matches silindi");
              }
            });
          });
          //meydan okunan waiting maci sil 
          User.update({'googleUserId' : meydanOkunanId}, {$pull: {'waiting': {matchId : matchId}}}, function(err, data){
            if(err){
              console.log(err);
            }
            if(data){
              console.log("waiting silindi");
            }
          });
        }
        if(meydanOkuyanScore == -1){
          match.matchStatus =true;
          match.save();
        }
      }
    }
  });
 });
}
//setInterval(intervalFunc, 1000);




app.get('/authenticate', (req, res) =>{
  const payload = {
    googleUserId: req.query.userId
  };
  const token = jwt.sign(payload, req.app.get('api_secret_key'),{
    expiresIn : 720 //12 saat
  });
  res.json({
    status: 200,
    token
  });
  /*
  User.findOne({'googleUserId' : req.query.userId}, function(err, user){
    if(err){
      console.log(err);
    }
    if(!user){
      res.json({
        status: false,
        messages: 'Authentication failed, user not found.'
      })
    }else{
      const payload = {
        googleUserId: req.query.userId
      };
      const token = jwt.sign(payload, req.app.get('api_secret_key'),{
        expiresIn : 720 //12 saat
      });
      res.json({
        status: 200,
        token
      });
    }
  });
  */
});



//Home page
app.get("/", function(req, res) {
  res.send("Home");
});

//FEEDBACK
app.get("/api/feedback", function(req, res){
  var userId = req.query.userId;
  var userName = req.query.userName;
  var messages = req.query.messages;
  Feedback.create({
    googleUserId : userId,
    userName: userName,
    messages : messages
    },function(err, feedback){
      if (err) {
          console.log(err);
      }else {
        console.log(messages);
          console.log("Added messages");
          res.json({status: 200, messages: 'ok', feedback: feedback})
      }
  });
});

//UPDATE USER NAME
app.get("/api/update/username", function(req, res) {
  var data = {
    userName: req.query.userName,
    changeUserName:true
  }
  var query = {
    'googleUserId':req.query.userId,
    'changeUserName':false
  }
  //User name control yapilacak
    User.findOneAndUpdate(query, data, {}, function (err, data) {
      if(err){
        console.log(err);
      }else {
        res.json({status: 200, messages: 'ok', user: data})
      }
    });
});

//UPDATE COIN
app.get("/api/update/coin", function(req, res){
  var data = {
    coin : req.query.coin
  }
  var query = {
    'googleUserId' : req.query.userId
    //'googleEmail' : req.query.googleEmail,
    //'googleUserId' : req.query.googleUserId
  }

  User.findOneAndUpdate(query, data, {}, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.json({status: 200, messages: 'ok', user: data})
    }
  })
});


//UPDATE AVATARID
app.get("/api/update/avatarId", function(req, res){
  var data = {
    avatarId : req.query.avatarId
  }
  var query = {
    'googleUserId' : req.query.userId
    //'googleEmail' : req.query.googleEmail,
    //'googleUserId' : req.query.googleUserId
  }

  User.findOneAndUpdate(query, data, {}, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.json({status: 200, messages: 'Change Avatar'})
    }
  })
});



app.get("/api/login", function(req, res){
  User.findOne({'googleUserId' : req.query.userId}, function(err, user){
    if(err){
      console.log(err);
    }
    if(user){
      console.log("User Mevcut");
      res.json({status: 200, messages:'User Exist', exists : user.userName});
    }else{
      console.log("User Mevcut Degil");
      res.json({status: 200, messages: 'User Not Exist'});
    }
  })
});

//REGISTER USER
app.get("/api/register", function(req, res){
    var googleUserId =  req.query.googleUserId;
    var googleUserName = req.query.googleUserName;
    var googleEmail = req.query.googleEmail;
    var userName = req.query.userName;
    var changeUserName = false;
    var numberOfWins = "0";
    var numberOfDefeats = "0";
    var coin =  "100";
    var timeModeHighScore = "0";
    var classicModeHighScore = "0";

  User.findOne({'googleUserId' : req.query.googleUserId}, function(err, exists){
    if (err) {
      console.log(err);
    }
    if(exists) {
      console.log("Hesap zaten kayitli");
      console.log(exists);
      res.json({status: 200, messages: 'ok', user: exists})
    }else{
      User.create({
        googleUserId: googleUserId,
        googleUserName: googleUserName,
        googleEmail : googleEmail,
        userName : userName,
        changeUserName : changeUserName,
        numberOfWins : numberOfWins,
        numberOfDefeats : numberOfDefeats,
        coin : coin,
        timeModeHighScore : timeModeHighScore,
        classicModeHighScore : classicModeHighScore
        },function(err, newUser){
          if (err) {
              console.log(err);
          }else {
              console.log("Kullanici eklendi");
              res.json({status: 200, messages: 'ok', user: newUser})
          }
      });
    }
    });
});

//GET FRIENDS
app.get("/api/getFriends", function(req, res){
  var friendsArray = [];
  var friendsCount = 0;
  User.findOne({googleUserId: req.query.userId})
  .then((data) => {
    if(data.friends.count == 0){
      res.json({status: 200, messages: 'Hic arkadasi yok'});
    }
    var arraySize = data.friends.length;
    data.friends.forEach(function(friend){
      if(friend.accepted == true){
        friendsCount++;
      }
    });

    data.friends.forEach(function(friend){
      arraySize--;
      console.log(friend);
        User.findOne({googleUserId: friend.userId})
        .then((data) =>{
          console.log("user find");
          if(friend.accepted == true){
          friendsArray.push({
            userId : friend.userId,
            userName : data.userName,
            avatarId : data.avatarId
          });
        }
        })
        .then((data) =>{
          console.log(arraySize, "arr");

          console.log(friendsArray.length, "ffri");
          console.log(friendsCount)

            if(friendsArray.length == friendsCount){
              console.log("2");
              console.log(friendsArray.length, "11");
              console.log(friendsCount , "111");
              res.json({status: 200, messages:'Get Friends', friends: friendsArray});
            }

        })
        .catch((err)=>{
          console.log(err);
      });
    });
  })
  .catch((err)=>{
    console.log(err);
});
});

//GET FRIENDS REQUEST
app.get("/api/getFriendsRequest", function(req, res){
  var friendsArray = [];
  var friendsCount = 0;
  User.findOne({googleUserId: req.query.userId})
  .then((data) => {
    console.log("1");
    if(data.friends.count == 0){
      res.json({status: 200, messages: 'Hic istegi yok'});
    }
    var arraySize = data.friends.length;
    data.friends.forEach(function(friend){
      if(friend.accepted == false){
        friendsCount++;
      }
    });

    data.friends.forEach(function(friend){
      arraySize--;
      console.log(friend);
        User.findOne({googleUserId: friend.userId})
        .then((data) =>{
          console.log("user find");
          if(friend.accepted == false){
          friendsArray.push({
            userId : friend.userId,
            userName : data.userName,
            avatarId : data.avatarId
          });
        }
        })
        .then((data) =>{
          console.log(arraySize, "arr");

          console.log(friendsArray.length, "ffri");
          console.log(friendsCount, "count");
            if(friendsArray.length == friendsCount){
              console.log("2");
              console.log(friendsArray.length, "11");
              console.log(friendsCount , "111");
              res.json({status: 200, messages:'Get Friends Request', friends: friendsArray});
            }
        })
        .catch((err)=>{
          console.log(err);
      });
    });
  })
  .catch((err)=>{
    console.log(err);
});
});

//GET WAITING MATCH
app.get("/api/getWaitingMatches", function(req, res){
  User.findOne({googleUserId: req.query.userId}, function(err, result){
    if(err){
      console.log(err);
    }
    if(result){
      waiting = result.waiting.filter(function(item){
        return (item.matchType == req.query.matchType);
      });
      console.log(waiting.reverse());

      sent = result.sentMatches.filter(function(item){
        return (item.matchType == req.query.matchType);
      });
      console.log(sent.reverse());
      res.json({status: 200, messages:'ok', waitingMatches: waiting.reverse(), sentMatches: sent.reverse()});
    }
  });
});

//GET FINISHED MATCH
app.get("/api/getFinishedMatches", function(req, res){
  User.findOne({googleUserId: req.query.userId}, function(err, result){
    if(err){
      console.log(err);
    }
    if(result){
      last =  function(array, n) {
        if (array == null) 
          return void 0;
        if (n == null) 
           return array[array.length - 1];
        return array.slice(Math.max(array.length - n, 0)); 
        };
        console.log(last(result.finished, 20));
        var tempArray = [];
        //mac tipine gore ayir
        result.finished.forEach(function(item){
          if(item["matchType"] == req.query.matchType){
            tempArray.push(item);
          }
        });
        //ters cevirip gonder
      res.json({status: 200, messages:'ok', finishedMatches: last(tempArray, 20).reverse()});
    }
  });
});

//ADD FRIEND
app.get("/api/addFriend", function(req, res){
  /*
    //benim arkadaslarim arasina
    User.findOne({'googleUserId' : req.query.userId, 'friends': {$elemMatch:{userId : req.query.friendUserId}}}, function(err, friend){
      if(err){
        console.log(err);
      }
      if(friend){
        console.log("Friend found");
        res.json({status:200, messages: 'ok', user:friend});
      }else{
        console.log("Friend not found");
        User.findOne({googleUserId: req.query.userId}).populate('friends').exec(function(err, result){
          result.friends.push({avatarId : req.query.friendAvatarId, userName : req.query.friendUserName, userId : req.query.friendUserId});
          result.save();
          res.json({status : 200, messages: 'ok'});
        });
      }
    });
  */
  User.findOne({'googleUserId' : req.query.userId, 'friends': {$elemMatch:{userId : req.query.friendUserId}}}, function(err, friend){
    if(err){
      console.log(err);
    }
    if(friend){
      console.log("Friend found");
      res.json({status:200, messages: 'Friend Found'});
    }else{
      console.log("Friend not found");
      //beni arkadas eklesin
      User.findOne({'googleUserId' : req.query.friendUserId, 'friends': {$elemMatch:{userId : req.query.userId}}}, function(err, result){
        if(err){
          console.log(err);
        }
        if(result){
          console.log("Istek mevcut");
          res.json({status:200, messages: 'Istek mevcut'});
        }else{
          console.log("Istek mevcut degil");
          User.findOne({'googleUserId' : req.query.friendUserId}, function(err, data){
            data.friends.push({avatarId : req.query.avatarId, userName : req.query.userName, userId : req.query.userId});
            data.save();
            res.json({status : 200, messages: 'Add friend request'});
          });
        }
      });
    }
  });
});

app.get("/api/friendRequestStatus", function(req, res){
  if(req.query.requestStatus == "true"){
    //Bana ekle
    User.findOne({'googleUserId' : req.query.userId}, function(err, result){
      result.friends.forEach(function(friend){
        if(friend.userId == req.query.friendUserId){
          friend.accepted = "true";
          result.save();
        }
      });
      //Gonderene ekle
    User.findOne({'googleUserId' : req.query.friendUserId}, function(err, data){
      if(data){
        data.friends.push({avatarId: req.query.avatarId, userName : req.query.userName, userId : req.query.userId, accepted : "true"});
        data.save();
        res.json({status:200, messages:'Added Friend'});
      }
    });
    });
  }else{
    //Bekleyen istegi sil
    User.update({'googleUserId' : req.query.userId}, {$pull: {'friends': {userId : req.query.friendUserId}}}, function(err, data){
      if(err){
        console.log(err);
      }
      if(data){
        console.log("silindi");
        res.json({status: 200, messages: 'Delete Friend'});
      }
    });
  }
});

//GLOBAL SEARCH USER
app.get("/api/searchUser", function(req, res){
  User.findOne({userName : req.query.userName}, function(err, data){
    if(err)
      console.log(err);
    if(data)
      res.json({status: 200, messages: 'ok', exists: data.userName});
  });
});

//SEARCH FRIEND
app.get("/api/searchFriend", function(req, res){
  User.findOne({'userName' : req.query.userName, 'friends': {$elemMatch:{userName : req.query.friendUserName}}}, function(err, friend){
    if(friend){
      console.log("Friend found");
      res.json({status:200, messages: 'ok', friend:friend});
    }else{
      console.log("Friend not found");
      res.json({status:200, messages: 'Friend not found'});
    }
  });
});

//CREATE RANDOM MATCH
app.get("/api/createMatch", function(req, res){
  User.findOne({'googleUserId' : req.query.userId}, function(err, data){
    if(data.coin >= 1000){
      data.coin -= 1000;
      data.save();
      User.find({}, function(err, users) {
        if(err){
          console.log(err);
        }
        if(users){
          var userMap = [];
    
          users.forEach(function(user) {
            if(user.googleUserId !== req.query.userId){
              userMap.push(user._id);
            }
          });
          //Random bir user sec
          var random = Math.floor(Math.random() * userMap.length);
          console.log(userMap[random]);
    
          User.findOne({_id : userMap[random]}, function(err, result){
            if(req.query.userId !== result.googleUserId){
                var userName1 = req.query.userName; //Meydan okuyan username
                var userName2 = result.userName;  //Meydan okunan username
                var userId1 = req.query.userId; //Meydan okuyan userId
                var userId2 = result.googleUserId;  //Meydan okunan userId
                var avatarId1 = req.query.avatarId;
                var avatarId2 = result.avatarId;
    
                Match.create({
                  userName1 : userName1,
                  userName2 : userName2,
                  userId1 : userId1,
                  userId2 : userId2,
                  score1 : -1,
                  score2 : -1,
                  matchType : req.query.matchType,
                  avatarId1 : avatarId1,
                  avatarId2 : avatarId2
                }, function(err, data){
                  if(err)
                    console.log(err);
                  else{
                    console.log("Match olusturuldu...!");
                    res.json({status: 200, messages: 'ok', matchId:data._id});
                  }
                });
            }
        });
      }
      });
    }
    else{
      res.send({status:500, messages: 'Yeterli coin yok'});
    }
  });
});

//CREATE FRIEND MATCH
app.get("/api/createFriendMatch", function(req, res){
  var userName1 = req.query.userName; //Meydan okuyan username
  var userName2 = req.query.friendUserName;  //Meydan okunan username
  var userId1 = req.query.userId; //Meydan okuyan userId
  var userId2 = req.query.friendUserId;  //Meydan okunan userId
  var avatarId1 = req.query.avatarId;
  var avatarId2 = req.query.friendAvatarId;

  User.findOne({'googleUserId' : req.query.userId}, function(err, user){
    if(user.coin >= 1000){
      user.coin -= 1000;
      user.save();
      Match.create({
        userName1 : userName1,
        userName2 : userName2,
        userId1 : userId1,
        userId2 : userId2,
        score1 : -1,
        score2 : -1,
        matchType : req.query.matchType,
        avatarId1 : avatarId1,
        avatarId2 : avatarId2
      }, function(err, data){
        if(err)
          console.log(err);
        else{
          console.log("Match olusturuldu...!");
          res.json({status: 200, messages: 'ok', data:data});
        }
      });
    }else{
      res.json({status: 500, messages: 'Yetersiz coin'});
    }
  });
});

app.get("/api/deleteWaitingMatch", function(req, res){
  User.update({'googleUserId' : req.query.userId}, {$pull: {'waiting': {matchId : req.query.matchId}}}, function(err, data){
    if(err){
      console.log(err);
    }
    if(data){
      Match.findById(req.query.matchId, function(err, match){
        if(match){
          User.findOne({'googleUserId' : match.userId1}, function(err, data){
            data.coin += 1000;
            data.save();
            console.log("silindi");
            //matchId sinden useId1 bul sonra useri ara puani ver
            res.json({status: 200, messages: 'Delete waiting match'});
          });
        }
      });
    }
  });
});

//UPDATE MATCH SCORE
app.get("/api/update/match/score", function(req,res){
  Match.findOne({
    '_id' : req.query.matchId
  },function(err,data){
    if(err)
      console.log(err);
    if(data){
      var data1 = {
        userId1 : req.query.userId,
        score1 : req.query.score,
      }

      var data2 = {
        userId2 : req.query.userId,
        score2 : req.query.score,
      }

      if(data.userId1 == req.query.userId)
        var tempData = data1;
      if(data.userId2 == req.query.userId)
        var tempData = data2;

      console.log(tempData);
      var query = {
        "_id" : req.query.matchId
      }
      Match.findOneAndUpdate(query, tempData, {}, function(err, data){
        if(err){
          console.log(err)
        }else{
          Match.findOne({
            '_id': req.query.matchId
          }, function(err, data){
            if(err){
              console.log(err);
            }
            if(data){
              var meydanOkuyan = data.userId1;
              var meydanOkunan = data.userId2;

              if(data.score1 != -1 && data.score2 != -1){
                //COINLERI GUNCELLE
                console.log("Coinler guncellenecek");
                
                //meydan okuyan kazanirsa
                if(data.score1 > data.score2){
                  console.log(data.score1);
                  console.log(data.score2);
                  //Meydan okuyan kazanirsa
                  User.findOne({googleUserId : data.userId1}, function(err, result){
                    if(err){
                      console.log(err)
                    }else{
                      //Meydan okuyana coin ver Finished ekle
                      result.coin += 2000;
                      result.numberOfWins +=1;
                      result.finished.push({
                        avatarId : data.avatarId2,
                        userId : data.userId2,
                        userName : data.userName2,
                        matchId : data.matchId,
                        myScore : data.score1,
                        enemyScore : data.score2,
                        matchStatus : "win",
                        matchType : data.matchType
                      });
                      result.save();
                      }
                  });

                  //Meydan Okunan Finished ekle
                  User.findOne({googleUserId: data.userId2}).populate('finished').exec(function(err, result){
                    if(err){
                      console.log(err);
                    }
                    if(result){
                      result.numberOfDefeats += 1; 
                      result.finished.push({
                        avatarId : data.avatarId1,
                        userId : data.userId1,
                        userName : data.userName1, 
                        matchId : data.matchId, 
                        myScore : data.score2, 
                        enemyScore : data.score1,
                        matchStatus : "lose",
                        matchType : data.matchType
                      });
                      result.save();
                    }
                  });
                }

                //beraberlik
                if(data.score1 == data.score2){
                  User.findOne({googleUserId : data.userId2}, function(err, result){
                    if(err){
                      console.log(err)
                    }else{
                      //Meydan okunana  Finished ekle
                      result.coin += 0;
                      result.numberOfWins += 0;
                          result.finished.push({
                            avatarId : data.avatarId1,
                            userId : data.userId1,
                            userName : data.userName1,
                            matchId : data.matchId,
                            myScore : data.score2,
                            enemyScore : data.score1,
                            matchStatus : "draw",
                            matchType : data.matchType
                          });
                          result.save();
                    }
                  });
                  //Meydan okuyan Finished ekle
                  User.findOne({googleUserId: data.userId1}).populate('finished').exec(function(err, result){
                    if(err){
                      console.log(err);
                    }
                    if(result){
                      result.numberOfDefeats += 0;
                      result.finished.push({
                        avatarId : data.avatarId2,
                        userId: data.userId2,
                        userName : data.userName2,
                        matchId : data.matchId,
                        myScore : data.score1,
                        enemyScore : data.score2,
                        matchStatus : "draw",
                        matchType : data.matchType
                      });
                      result.save();
                    }
                  });
                }

                //meydan okunan kazanirsa
                if(data.score1 < data.score2){
                  //Meydan okunan kazanirsa
                  User.findOne({userName : data.userName2}, function(err, result){
                    if(err){
                      console.log(err)
                    }else{
                      //Meydan okunana coin ver Finished ekle
                      result.coin += 2000;
                      result.numberOfWins += 1;
                          result.finished.push({
                            avatarId : data.avatarId1,
                            userName : data.userName1,
                            matchId : data.matchId,
                            myScore : data.score2,
                            enemyScore : data.score1,
                            matchStatus : "win",
                            matchType : data.matchType
                          });
                          result.save();
                    }
                  });
                  //Meydan okuyan Finished ekle
                  User.findOne({userName: data.userName1}).populate('finished').exec(function(err, result){
                    if(err){
                      console.log(err);
                    }
                    if(result){
                      result.numberOfDefeats += 1;
                      result.finished.push({
                        avatarId : data.avatarId2,
                        userName : data.userName2,
                        matchId : data.matchId,
                        myScore : data.score1,
                        enemyScore : data.score2,
                        matchStatus : "lose",
                        matchType : data.matchType
                      });
                      result.save();
                    }
                  });
                }

                //Mac BITTI BEKLENEN MACI SIL
                User.update({'googleUserId' : data.userId2}, {$pull: {'waiting': {matchId : data._id}}}, function(err, data){
                  if(err){
                    console.log(err);
                  }
                  if(data){
                    console.log("waiting silindi");
                  }
                });

                //gonderilen maci sil
                User.update({'googleUserId' : data.userId1}, {$pull: {'sentMatches': {matchId : data._id}}}, function(err, data){
                  if(err){
                    console.log(err);
                  }
                  if(data){
                    console.log("sent matches silindi");
                  }
                });

                data.matchStatus = true;
                data.save();
              }else{
                //meydan okuyan mac bitti rakibin waiting ekle
                User.findOne({googleUserId: data.userId2}).populate('waiting').exec(function(err, result){
                  if(err){
                    console.log(err);
                  }
                  if(result){
                    result.waiting.push({avatarId: data.avatarId1, googleUserId : data.userId1, userName : data.userName1, matchId : data._id, matchType : data.matchType});
                    result.save();
                  }
                });

                User.findOne({googleUserId: data.userId1},function(err, result){
                  if(err){
                    console.log(err);
                  }
                  if(result){
                    console.log("sent matches olusturuldu");
                    result.sentMatches.push({
                      avatarId : data.avatarId2,
                      googleUserId : data.userId2,
                      userName : data.userName2,
                      myScore : data.score1,
                      matchType : data.matchType,
                      matchId : data._id
                    });
                    result.save();
                  }
                });
              }

            }
          });
          res.json({status: 200, messages: 'ok'})
        }
      })
    }
  });
});

//UPDATE MATCH STATUS
app.get("/api/update/match/status", function(req, res){
  //meydan okuyan kisinin kullanici adini ve matchId al
  Match.findOneAndUpdate({matchId : req.query.matchId, userName1 : req.query.userName},
    {matchStatu : req.query.matchStatu}, {}, function(err, data){
    if(err){
      console.log(err);
      res.json({status:500, messages:'Error'});
    }
    if(data){
      console.log(data);
      //meydan okunan kisi kabul etmezse kayip bedeli iade et
      if(data.matchStatu === false){
        User.findOne({userName : data.userName1}, function(err, user){
            if(err){
              console.log(err);
            }
            if(user){
              user.coin += 500; //500 coin kayip bedeli
              user.save();
              console.log(user);
              //DELETE MATCH
              res.json({status: 200, messages:'ok'});
            }
        });
      }else{
        console.log("mac sonucu beklenecek");
        res.json({messages:'ok'});
      }
    }
  });
});

//ADD USER TO QUEUE
app.get("/api/addUserToQueue", function(req, res){

  var userName = req.query.userName;
  Queue.findOne({'userName' : userName}, function(err, exists){
    if(err){
      console.log(err)
    }
    if(exists){
      console.log("Hesap zaten kuyrukta");
      console.log(exists);
      res.json({status: 200, messages: 'ok', user:exists});
    }
    else{
      Queue.create({userName : userName, addTime : new Date()}, function(err, user){
        if(err){
          console.log(err);
        }else{
          console.log("User kuyruga eklendi..!");
          res.json({status: 200, messages: 'ok', addedUser : user});
          Queue.count({}, function(err, count){
            if(count > 1){
              Queue.find({}).sort({addTime : 'asc'}).limit(2).exec(function(err, readyUsers){
                var obj = JSON.parse(readyUsers);
                var userName1 = obj[0].userName;
                var userName2 = obj[1].userName;
                Match.create({})
              });
            }
          });
        }
      });
    }
  });
});


//TIME MODE HIGH SCORE UPDATE
app.get("/api/update/score/timeMode", function(req, res){
  var data = {
    googleUserId : req.query.userId,
    userName : req.query.userName,
    timeMode : req.query.timeHighScore
  }
  var query = {
    googleUserId : req.query.userId
  }

  Score.findOne({googleUserId : req.query.userId}, function(err,exists){
    if(err){
      console.log(err);
    }
    if(exists){
      console.log("User exist");
      var dbScore = exists.timeMode;
      if(parseInt(dbScore) < parseInt(req.query.timeHighScore)){
        exists.timeMode = req.query.timeHighScore;
        exists.userId = req.query.userId;
        exists.userName = req.query.userName;
        exists.save();
        res.json({status: 200, messages:'ok'});
       }else{
         console.log("LocalScore < dbScore Failed to update.!");
         res.json({status: 500, error: "LocalScore < dbScore Failed to update.!"});
       }
    }
    else{
      //User'a ait skor yoksa yarat
      Score.create(data, function(err, score){
        if(err){
          console.log(err);
        }
        if(score){
          res.json({status: 200, messages:'ok', score:score});
        }
      });
    }
  });
});


//CLASSIC MODE HIGH SCORE UPDATE
app.get("/api/update/score/classicMode", function(req, res){
  var data = {
    googleUserId : req.query.userId,
    userName : req.query.userName,
    classicMode : req.query.classicHighScore
  }
  var query = {
    googleUserId : req.query.userId,
  }

  Score.findOne({googleUserId : req.query.userId}, function(err,exists){
    if(err){
      console.log(err);
    }
    if(exists){
      console.log("User exist");
      var dbScore = exists.classicMode;
      if(parseInt(dbScore) < parseInt(req.query.classicHighScore)){
        exists.classicMode = req.query.classicHighScore;
        exists.userId = req.query.userId;
        exists.userName = req.query.userName;
        exists.save();
        res.json({status: 200, messages: 'Score guncellendi'});
      }
      else{
        console.log("LocalScore < dbScore Failed to update.!");
        res.json({status: 200, messages: "LocalScore < dbScore Failed to update.!"});
      }    
    }
    else{
      //User'a ait skor yoksa yarat
      Score.create(data, function(err, score){
        if(err){
          console.log(err);
        }
        if(score){
          res.json({status: 200, messages:'Score olusturuldu'});
        }
      });
    }
  });
});


//SHOW USERS
app.get("/api/users", function(req, res){
      User.find({}, function(err, usersDB){
        if (err) {
          console.log(err);
        }else {
          console.log("*****************USERS*********************");
          console.log(usersDB);
          res.json({status: 200, messages: 'ok', user: usersDB})
        }
      });
});

//SHOW SCORES
app.get("/api/scores", function(req, res){
  Score.find({}, function(err, scoresDB){
    if (err) {
      console.log(err);
    }else {
      console.log("*****************SCORES*********************");
      console.log(scoresDB);
      res.json({status: 200, messages: 'ok', scores: scoresDB})
    }
  });

});

//SHOW QUEUE
app.get("/api/queues", function(req, res){
  Queue.find({}, function(err, queuesDB){
    if (err) {
      console.log(err);
    }else {
      console.log("*****************QUEUES*********************");
      console.log(queuesDB);
      res.json({status: 200, messages: 'ok', queues: queuesDB})
    }
  });

});

//GET COIN
app.get("/api/getUserData", function(req, res){

  User.findOne({googleUserId :req.query.userId}, function(err, user){
    if(err){
      console.log(err);
    }
    if(user){
      res.json({status: 200, messages : 'ok', user: user})
    }
  });
});

//GET TIME MODE LEADER BOARD
app.get("/api/getTimeModeLeaderboard", function(req, res){
  Score.find({}).sort({timeMode: 'desc'}).limit(10).exec(function(error, leaderboard){
    if(error){
      console.log(error);
    }else{
      console.log("***********TIME MODE LEADERBOARD***********");
      console.log(leaderboard);
      res.json({status: 200, messages: 'ok', leaderboard : leaderboard});
    }
  });
});

//GET CLASSIC MODE LEADERBOARD
app.get("/api/getClassicModeLeaderboard", function(req, res){
  Score.find({}).sort({classicMode: 'desc'}).limit(10).exec(function(error, leaderboard){
    if(error){
      console.log(error);
    }else{
      console.log("***********CLASSIC MODE LEADERBOARD***********");
      console.log(leaderboard);
      res.json({status: 200, messages: 'ok', leaderboard : leaderboard});
    }
  });
});

//Hata sayfasi
app.get("*", function(req, res){
  res.send("Sayfa bulunamadı..!");
});

app.listen(3000);
