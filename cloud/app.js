// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var wechat = require('wechat');
var config = require('cloud/config.js');

var app = express();

// App 全局配置
app.use(express.query());

APPID = AV.applicationId; // 你的应用 id
MASTER_KEY = AV.masterKey; //你的应用 master key

token = 'ADAQABAAABAQDktH6UrE77vsp';

app.use('/we', wechat( token, function (req, res, next) {
  res.writeHead(200);
  res.end('hello node api');
}));

app.listen();
