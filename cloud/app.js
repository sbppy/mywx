// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var wechat = require('wechat');
//var config = require('cloud/config.js');

var app = express();

var WxappUser = AV.Object.extend("WxappUser");
//var wxappUser = new WxappUser();


// App 全局配置
app.use(express.query());

APPID = AV.applicationId; // 你的应用 id
MASTER_KEY = AV.masterKey; //你的应用 master key

token = 'ADAQABAAABAQDktH6UrE77vsp';

var config = {
 token: 'ADAQABAAABAQDktH6UrE77vsp',
 appid: 'wx639ea8a58aa706ca',
 encodingAESKey: 'i4aDBFCuxULvr8Eixrc0hLhx7SkqllHnsiGfL6KCY40'
};

app.use('/base', wechat( token, function (req, res, next) {
  res.writeHead(200);
  res.end('hello node api');
}));

app.get('/u*', wechat( config, function (req, res, next) {
  res.writeHead(200);
  res.end('hello node api');
}));

app.post('/u*', wechat( config, wechat.text(function (message, req, res, next) {
  res.reply('hehe  ' + message.FromUserName + req.path);
  //res.writeHead(200);
  //res.end('hello node api');
}).event(function (message, req, res, next) {
 if (message.Event == 'subscribe') {
   res.reply('subscribe' );
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
   res.reply('subscribe' );
 }else{
   res.reply('menu ' + message.EventKey);
 }
})));


app.listen();
