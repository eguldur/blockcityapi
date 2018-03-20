var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose").set('debug', true);

var User = require("./models/user");
var Score = require("./models/score");
var Match = require("./models/match");
var Queue = require("./models/queue");



//mongoose.connect("mongodb://localhost/blockcity", {useMongoClient: true});
mongoose.connect('mongodb://m.aslann35:006f9c60@ds233748.mlab.com:33748/mydb')
    .then(()=> { console.log(`Succesfully Connected to the Mongodb Database`)})
    .catch(()=> { console.log(`Error Connecting to the Mongodb Database`)});

app.use(bodyParser.urlencoded({extended:true}));


/*
  User.create({
    userId: "12345678",
    userName: "MehmetASLAN",
    email: "m.aslann35@gmail.com",
    score: "588"
  },function(err, userDB){
    if (err) {
      console.log(err);
    }else {
      console.log("Kullanici eklendi");
    }
  });
*/

//Home page
app.get("/", function(req, res) {
  res.send("Home");
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
    'userName' : req.query.userName,
    'googleEmail' : req.query.googleEmail,
    'googleUserId' : req.query.googleUserId
  }

  User.findOneAndUpdate(query, data, {}, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.json({status: 200, messages: 'ok', user: data})
    }
  })
});

//KULLANICI KAYIT
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
      Queue.create({userName : userName}, function(err, user){
        if(err){
          console.log(err);
        }else{
          console.log("User kuyruga eklendi..!");
          res.json({status: 200, messages: 'ok', addedUser : user});
        }
      });
    }
  });
});


//TIME MODE HIGH SCORE GUNCELLE
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
      if(parseInt(dbScore) < parseInt(req.query.timeHighScore)){

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
  });
});


//CLASSIC MODE HIGH SCORE GUNCELLE
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
  });
});

//UPDATE MATCH RESULT(EKSIK)
app.get("/update/matchResult", function(req, res){
  var matchResult = req.query.matchResult;

  if(matchResult == "win"){
    
  }else{

  }
});

//KULLANICILARI LISTELE
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

//SKORLARI LISTELE
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

//KUYRUKTAKILERI LISTELE
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

//GETCOIN
app.get("/getUserData", function(req, res){

  User.findOne({userName :req.query.userName, 
                googleEmail: req.query.googleEmail, 
                googleUserId:req.query.googleUserId}, function(err, user){
    if(err){
      console.log(err);
    }
    if(user){
      res.json({status: 200, messages : 'ok', user: user})
    }
  });
});

//GET TIME MODE LEADERBOARD
app.get("/getTimeModeLeaderboard", function(req, res){
  Score.find({}).sort({timeMode: '-1'}).limit(2).exec(function(error, leaderboard){
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
  Score.find({}).sort({timeMode: '-1'}).limit(2).exec(function(error, leaderboard){
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
