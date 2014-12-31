// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var wechat = require('wechat');
//var config = require('cloud/config.js');

var app = express();

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

app.use('/we', wechat( token, function (req, res, next) {
  res.writeHead(200);
  res.end('hello node api');
}));

app.use('/wes', wechat( config, wechat.text(function (message, req, res, next) {
  res.reply('hehe  ' + message.FromUserName);
  //res.writeHead(200);
  //res.end('hello node api');
}).event(function (message, req, res, next) {
 if (message.EventKey == 'menu_flow') {
   res.reply({
     type: "event",
     Event: "view",
     EventKey: "http://v.qq.com/"
   });
 }else{
   res.reply('menu ' + message.EventKey);
 }
})));


app.listen();
