var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var User = require("./models/user");

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

//Data update
app.get("/update", function(req, res) {
  var data = {
    userId: req.query.userId,
    userName: req.query.userName,
    email : req.query.email,
    score : req.query.score
  }

  User.findOneAndUpdate({
  "email" : req.query.email     // query document
}, data, {
  upsert : true      // options
}, function (err, data) {
  if(err){
    console.log(err);
  }else {
    res.json({status: 200, messages: 'ok', user: data})
  }
});
});

//Kullanıcı kayit
app.get("/register", function(req, res){
  var userId = req.query.userId;
  var userName = req.query.userName;
  var email = req.query.email;
  var score = req.query.score;

  User.findOne({'email' : email}, function(err, exists){
  if (err) {
    console.log(err);
  }else {
    console.log("account already registered");
    console.log(exists);
  }
    User.create({
      userId: userId,
      userName: userName,
      email: email,
      score: score
    },function(err, newUser){
      if (err) {
        console.log(err);
      }else {
        console.log("Kullanici eklendi");
          res.json({status: 200, messages: 'ok', user: newUser})
      }
    });
  });
});

//Kullanicilari listele
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

//Hata sayfasi
app.get("*", function(req, res){
  res.send("Sayfa bulunamadı..!");
});

app.listen(3000);
