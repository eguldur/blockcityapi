var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose").set('debug', true);
var shortid = require('shortid');
var User = require("./models/user");
var Score = require("./models/score");
var Match = require("./models/match");
var Queue = require("./models/queue");
var Feedback = require("./models/feedback");



//mongoose.connect("mongodb://localhost/blockcity", {useMongoClient: true});
mongoose.connect('mongodb://m.aslann35:006f9c60@ds233748.mlab.com:33748/mydb')
    .then(()=> { console.log(`Succesfully Connected to the Mongodb Database`)})
    .catch(()=> { console.log(`Error Connecting to the Mongodb Database`)});

app.use(bodyParser.urlencoded({extended:true}));

//Home page
app.get("/", function(req, res) {
  res.send("Home");
});

//FEEDBACK
app.get("/feedback", function(req, res){
  var userName = req.query.userName;
  var messages = req.query.messages;
  Feedback.create({
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
app.get("/update/username", function(req, res) {
  var data = {
    userName: req.query.userName,
    googleUserName: req.query.googleUserName,
    changeUserName:true
  }
  var query = {
    'googleUserName':req.query.googleUserName,
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
app.get("/update/coin", function(req, res){
  var data = {
    coin : req.query.coin
  }
  var query = {
    'userName' : req.query.userName
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

//REGISTER USER
app.get("/register", function(req, res){
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

  User.findOne({'userName' : req.query.userName}, function(err, exists){
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
app.get("/getFriends", function(req, res){
  User.findOne({userName: req.query.userName}).populate('friends').exec(function(err, result){
    if(err){
      console.log(err);
    }
    if(result){
      res.json({status: 200, messages:'ok', friends: result});
    }
  });
});

//GET WAITING MATCH
app.get("/getWaitingMatches", function(req, res){
  User.findOne({userName: req.query.userName}).populate('waiting').exec(function(err, result){
    if(err){
      console.log(err);
    }
    if(result){
      res.json({status: 200, messages:'ok', waitingMatches: result});
    }
  });
});

//GET FINISHED MATCH
app.get("/getFinishedMatches", function(req, res){
  User.findOne({userName: req.query.userName}).populate('finished').exec(function(err, result){
    if(err){
      console.log(err);
    }
    if(result){
      res.json({status: 200, messages:'ok', finishedMatches: result});
    }
  });
});

//ADD FRIEND
app.get("/addFriend", function(req, res){
  User.findOne({'userName' : req.query.userName, 'friends': {$elemMatch:{userName : req.query.friendUserName}}}, function(err, friend){
    if(friend){
      console.log("Friend found");
      res.json({status:200, messages: 'ok', user:friend});
    }else{
      console.log("Friend not found");
      User.findOne({userName: req.query.userName}).populate('friends').exec(function(err, result){
        result.friends.push({userName : req.query.friendUserName});
        result.save();
        res.json({status : 200, messages: 'ok'});
      });
    }
  });
});

//GLOBAL SEARCH USER
app.get("/searchUser", function(req, res){
  User.findOne({userName : req.query.userName}, function(err, data){
    if(err)
      console.log(err);
    if(data)
      res.json({status: 200, messages: 'ok', exists: data.userName});
  });
});

//SEARCH FRIEND
app.get("/searchFriend", function(req, res){
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
app.get("/createMatch", function(req, res){
  //User sayisini getir
  User.count().exec(function (err, count) {
    //Random bir user sec
    var random = Math.floor(Math.random() * count);
    User.findOne().skip(random).exec(
      function (err, result) {
        if(req.query.userName === result.userName){
          console.log("Patladik");
          random = Math.floor(Math.random() * count);
          User.findOne().skip(random).exec(function(err, result){
            var userName1 = req.query.userName; //Meydan okuyan username
            var userName2 = result.userName;  //Meydan okunan username
            Match.create({
              matchId : shortid.generate(),
              userName1 : userName1,
              userName2 : userName2,
              score1 : -1,
              score2 : -1
            }, function(err, data){
              if(err)
                console.log(err);
              else{
                console.log("Match olusturuldu...!");
                res.json({status: 200, messages: 'ok', data:data});
              }
            });
          });
        } else{
          User.findOne().skip(random).exec(function(err, result){
            var userName1 = req.query.userName; //Meydan okuyan username
            var userName2 = result.userName;  //Meydan okunan username
            Match.create({
              matchId : shortid.generate(),
              userName1 : userName1,
              userName2 : userName2,
              score1 : -1,
              score2 : -1
            }, function(err, data){
              if(err)
                console.log(err);
              else{
                console.log("Match olusturuldu...!");
                res.json({status: 200, messages: 'ok', data:data});
              }
            });
          });
        }
          console.log(result);
        })
  });
});

//CREATE FRIEND MATCH
app.get("/createFriendMatch", function(req, res){
  var userName1 = req.query.userName; //Meydan okuyan username
  var userName2 = req.query.friendUserName;  //Meydan okunan username
  Match.create({
    matchId : shortid.generate(),
    userName1 : userName1,
    userName2 : userName2,
    score1 : -1,
    score2 : -1
  }, function(err, data){
    if(err)
      console.log(err);
    else{
      console.log("Match olusturuldu...!");
      res.json({status: 200, messages: 'ok', data:data});
    }
  });
});

//UPDATE MATCH SCORE
app.get("/update/match/score", function(req,res){
  Match.findOne({
    'matchId' : req.query.matchId
  },function(err,data){
    if(err)
      console.log(err);
    if(data){
      var data1 = {
        userName1 : req.query.userName,
        score1 : req.query.score,
      }

      var data2 = {
        userName2 : req.query.userName,
        score2 : req.query.score,
      }

      if(data.userName1 == req.query.userName)
        var tempData = data1;
      if(data.userName2 == req.query.userName)
        var tempData = data2;

      var query = {
        "matchId" : req.query.matchId
      }
      Match.findOneAndUpdate(query, tempData, {}, function(err, data){
        if(err){
          console.log(err)
        }else{
          Match.findOne({
            'matchId': req.query.matchId
          }, function(err, data){
            if(err){
              console.log(err);
            }
            if(data){
              var meydanOkuyan = data.userName1;
              var meydanOkunan = data.userName2;

              if(data.score1 != -1 && data.score2 != -1){
                //COINLERI GUNCELLE
                console.log("Coinler guncellenecek");

                if(data.score1 > data.score2){
                  //Meydan okuyan kazanirsa
                  User.findOne({userName : data.userName1}, function(err, result){
                    if(err){
                      console.log(err)
                    }else{
                      //Meydan okuyana coin ver Finished ekle
                      result.coin += 4000;
                      result.numberOfWins +=1;
                      result.finished.push({
                        userName : data.userName1,
                        matchId : data.matchId,
                        myScore : data.score1,
                        enemyScore : data.score2,
                        matchStatus : "win"});
                      result.save();
                      }
                  });

                  //Meydan Okunan Finished ekle
                  User.findOne({userName: data.userName2}).populate('finished').exec(function(err, result){
                    if(err){
                      console.log(err);
                    }
                    if(result){
                      result.numberOfDefeats += 1; 
                      result.finished.push({
                        userName : data.userName2, 
                        matchId : data.matchId, 
                        myScore : data.score2, 
                        enemyScore : data.score1,
                        matchStatus : "lose"});
                      result.save();
                    }
                  });
                }else{
                  //Meydan okunan kazanirsa
                  User.findOne({userName : data.userName2}, function(err, result){
                    if(err){
                      console.log(err)
                    }else{
                      //Meydan okunana coin ver Finished ekle
                      result.coin += 4000;
                      result.numberOfWins += 1;
                          result.finished.push({
                            userName : data.userName2,
                            matchId : data.matchId,
                            myScore : data.score2,
                            enemyScore : data.score1,
                            matchStatus : "win"});
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
                        userName : data.userName1,
                        matchId : data.matchId,
                        myScore : data.score1,
                        enemyScore : data.score2,
                        matchStatus : "lose"});
                      result.save();
                    }
                  });
                }
                //Mac BITTI BEKLENEN MACI SIL
                User.update({'userName' : data.userName2}, {$pull: {'waiting': {userName : data.userName1, matchId : data.matchId}}}, function(err, data){
                  if(err){
                    console.log(err);
                  }
                  if(data){
                    console.log("silindi");
                  }
                });
              }else{
                User.findOne({userName: data.userName2}).populate('waiting').exec(function(err, result){
                  if(err){
                    console.log(err);
                  }
                  if(result){
                    result.waiting.push({userName : data.userName1, matchId : data.matchId});
                    result.save();
                  }
                });
              }

            }
          });
          res.json({status: 200, messages: 'ok', match: data})
        }
      })
    }
  });
});

//UPDATE MATCH STATUS
app.get("/update/match/status", function(req, res){
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
app.get("/addUserToQueue", function(req, res){

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
app.get("/update/score/timeMode", function(req, res){
  var data = {
    userName : req.query.userName,
    timeMode : req.query.timeHighScore
  }
  var query = {
    userName : req.query.userName,
  }

  Score.findOne({'userName': req.query.userName}, function(err,exists){
    if(err){
      console.log(err);
    }
    if(exists){
      console.log("User exist");
      var dbScore = exists.timeMode;
    
      if(dbScore){
        if(parseInt(dbScore) < parseInt(req.query.timeHighScore)){
         exists.timeMode = req.query.timeHighScore;
        }else{
          console.log("LocalScore < dbScore Failed to update.!");
          res.json({status: 500, error: "LocalScore < dbScore Failed to update.!"});
        }
      }
      else{
        console.log("Kolon mevcut degil");
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
app.get("/update/score/classicMode", function(req, res){
  var data = {
    userName : req.query.userName,
    classicMode : req.query.classicHighScore
  }
  var query = {
    userName : req.query.userName,
  }

  Score.findOne({'userName': req.query.userName}, function(err,exists){
    if(err){
      console.log(err);
    }
    if(exists){
      console.log("User exist");
      var dbScore = exists.classicMode;
      if(parseInt(dbScore) < parseInt(req.query.classicHighScore)){

        Score.findOneAndUpdate(query, data, {upsert : true}, function(err, data){
          if(err){
            console.log(err)
          }else{
            console.log("User's high score has been improved.!");
            res.json({status: 200, messages: 'ok', data: data});
          }
        });
      }
      else{
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

//UPDATE MATCH RESULT(EKSIK)
app.get("/update/matchResult", function(req, res){
  var matchResult = req.query.matchResult;

  if(matchResult == "win"){
    
  }else{

  }
});

//SHOW USERS
app.get("/users", function(req, res){
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
app.get("/scores", function(req, res){
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
app.get("/queues", function(req, res){
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
app.get("/getUserData", function(req, res){

  User.findOne({userName :req.query.userName}, function(err, user){
    if(err){
      console.log(err);
    }
    if(user){
      res.json({status: 200, messages : 'ok', user: user})
    }
  });
});

//GET TIME MODE LEADER BOARD
app.get("/getTimeModeLeaderboard", function(req, res){
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
app.get("/getClassicModeLeaderboard", function(req, res){
  Score.find({}).sort({timeMode: '-1'}).limit(10).exec(function(error, leaderboard){
    if(error){
      console.log(error);
    }else{
      console.log(typeof leaderboard);
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
