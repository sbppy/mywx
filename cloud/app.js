// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var wechat = require('wechat');
var muser = require('cloud/muser.js');

//var config = require('cloud/config.js');

var app = express();
var AppUser = AV.Object.extend("AppUser");
var UserIdCounter = AV.Object.extend("UserIdCounter");

// App 全局配置
app.use(express.query());
app.use(express.bodyParser()); 

APPID = AV.applicationId; // 你的应用 id
MASTER_KEY = AV.masterKey; //你的应用 master key

var usertoken = '';


var config = {
 token: 'ADAQABAAABAQDktH6UrE77vsp',
 //token: '',
 appid: 'wx639ea8a58aa706ca',
 encodingAESKey: 'i4aDBFCuxULvr8Eixrc0hLhx7SkqllHnsiGfL6KCY40'
};

function randomString(length) {
  var chars = '0123456789abcdefghiklmnopqrstuvwxyz'.split('');

  if (! length) {
    length = Math.floor(Math.random() * chars.length);
  }
  var str = '';
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

function initUser(userId, openId) {
  var appUser = new AppUser();
  var token = randomString(6);
  appUser.set("userid", userId);
  appUser.set("openid", openId);
  appUser.set("token", token);

  appUser.save(null, {
    success: function(appUser) {
      // Execute any logic that should take place after the object is saved.
      //alert('New object created with objectId: ' + gameScore.id);
    },
    error: function(appUser, error) {
      // Execute any logic that should take place if the save fails.
      // error is a AV.Error with an error code and description.
      //alert('Failed to create new object, with error code: ' + error.description);
    }
  });
  return token;
}

app.use(function(req, res, next) {
//   var user = new AV.User();
  
  var urlPath = req.path;
  var query = new AV.Query(AppUser);
  var userid = urlPath.substr(2);
  //var printtype = '';
  
  if (urlPath.substr(0,2) == '/u'){
    query.equalTo("userid", userid);
    query.first({
      success: function(currentUser) {
        //for (var i = 0; i < results.length; i++) {
        //  var currentUser = results[i];
        if (currentUser){
          req.wechat_token = currentUser.get('token');
        }
        next();
        //}
      },
      error: function(error) {
        res.writeHead(200);
        res.end("Error: " + error.code + " " + error.message);
      }
    });
  }else{
    next();
  };
});

app.get('/u*', wechat( usertoken, function (req, res, next) {
  res.writeHead(200);
  res.end('hello node api');
}));

app.use('/u122333', wechat( usertoken, wechat.text(function (message, req, res, next) {
  res.reply('hehe  ' + message.FromUserName + req.path);
  //res.writeHead(200);
  //res.end('hello node api');
}).event(function (message, req, res, next) {
 if (message.Event == 'subscribe') {
   res.reply('subscribe' );
 }else if(message.Event == 'unsubscribe') {
   res.reply('unsubscribe' );
 }else{
   res.reply('menu ' + message.EventKey);
 }
})));

app.use('/base', wechat( config, wechat.text(function (message, req, res, next) {
  res.reply('hehe  ' + message.FromUserName + req.path);
  //res.writeHead(200);
  //res.end('hello node api');
}).event(function (message, req, res, next) {
 if (message.Event == 'subscribe') {
   var query = new AV.Query(UserIdCounter);
   query.get("54a63c14e4b021ec8f4ee469", {
     success: function(userIdCounter) {
       // The object was retrieved successfully.
       userIdCounter.increment("counter");
       userIdCounter.save();
       var token = initUser(userIdCounter.get("counter"),message.FromUserName);
       res.reply('subscribe!\n id:' + userIdCounter.get("counter") + '\n token:' + token);
     },
     error: function(userIdCounter, error) {
     // The object was not retrieved successfully.
     // error is a AV.Error with an error code and description.
       res.reply(error);
     }
   });
   
 }else if(message.Event == 'unsubscribe') {
   res.reply('unsubscribe' );
 }else{
   res.reply('menu ' + message.EventKey);
 }
})));


app.listen();
