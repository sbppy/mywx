// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var wechat = require('wechat');
var WechatAPI = require('wechat-api');
var muser = require('cloud/muser.js');

//var config = require('cloud/config.js');

var app = express();
var AppUser = AV.Object.extend("AppUser");
var UserIdCounter = AV.Object.extend("UserIdCounter");

// App 全局配置
app.set('views','cloud/views');   //设置模板目录
app.set('view engine', 'ejs');    // 设置template引擎

app.use(express.query());
app.use(express.bodyParser()); 

APPID = AV.applicationId; // 你的应用 id
MASTER_KEY = AV.masterKey; //你的应用 master key

var usertoken = '';

var accessConfig = {
 appid: 'wx639ea8a58aa706ca',
 secret: '9b8da813172b76ffb32237d16afae898'
};

var api = new WechatAPI(accessConfig.appid, accessConfig.secret, function (callback) {
  // 传入一个获取全局token的方法
  var query = new AV.Query(AppUser);
  query.equalTo("userid", 0);
  query.first({
    success: function(currentUser) {
      if (currentUser){
        var lastToken = currentUser.get('accessToken');
        callback(null, JSON.parse(lastToken));
      }
    },
    error: function(error) {
    }
  });
}, function (token, callback) {
  // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
  // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
  var query = new AV.Query(AppUser);
  query.equalTo("userid", 0);
  query.first({
    success: function(currentUser) {
      if (currentUser){
        currentUser.set('accessToken', JSON.stringify(token));
        currentUser.save();
      }
    },
    error: function(error) {
    }
  });
});

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

  if (urlPath.substr(0,2) == '/u'){
    query.equalTo("userid", parseInt(userid));
    query.first({
      success: function(currentUser) {
        //for (var i = 0; i < results.length; i++) {
        //  var currentUser = results[i];
        if (currentUser){
          //res.writeHead(200);
          //res.end(currentUser.get('token'));
          req.wechat_token = currentUser.get('token');
        //}else{
        //  res.writeHead(200);
        //  res.end("not found " + userid);
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
  res.reply(message.MsgType);
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
   var query = new AV.Query(AppUser);
   query.equalTo("openid", message.FromUserName);
   query.destroyAll({
     success: function(){
       //delete all objects by this query successfully.
     },
     error: function(err){
       //There was an error.
     }
   });
   res.reply('unsubscribe' );
 }else{
   res.reply('menu ' + message.EventKey);
 }
}).link(function (message, req, res, next) {
  // message为链接内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'link',
  // Title: '公众平台官网链接',
  // Description: '公众平台官网链接',
  // Url: 'http://1024.com/',
  // MsgId: '5837397520665436492' }
  res.reply(message.Url);
})));

app.get('/html/1', function(req, res){
  //api.getLatestToken(function(err, token){
  api.getIp(function(err, result){
    if (err){
      res.render('hello', {message: err})
    }else{
      res.render('hello', {message: result.ip_list});
    }
  });
  
});

app.listen();
