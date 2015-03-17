var express = require('express');
var path = require('path');
var mongoose = require('mongoose')
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var wget = require('wget')
var routes = require('./routes/index');
var users = require('./routes/users');
var moment = require('moment');
var weixin = require('./models/weixin')
var pic = require('./models/pic')
var util = require('./models/util')
var app = express();
mongoose.connect('mongodb://localhost/picinfo')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

weixin.token = 'rolselove'
//app.use('/', routes);
//app.use('/users', users);
app.get('/pic/:username', function(req, res){
    var user = req.params.username
    pic.findByUser(user, function(err, pics){
        if(err){
            console.log(err)
            return;
        }
        res.render('index',{
                 title:'pics',
                 pics:pics           
                 
        })
        
   })

})

app.get('/', function(req, res){
    if (weixin.checkSignature(req)) {
        res.send(200, req.query.echostr)
    } else {
        res.send(200, 'signature failed')
    }
})
weixin.eventMsg(function(msg) {
    console.log("eventMsg received");
    console.log(JSON.stringify(msg));
    resMsg = {
                fromUserName : msg.toUserName,
                toUserName : msg.fromUserName,
                msgType : "text",
                content : msg.fromUserName,
                funcFlag : 0
            };
    weixin.sendMsg(resMsg);

});
// 监听文本消息
weixin.textMsg(function(msg) {
    console.log("textMsg received");
    console.log(JSON.stringify(msg));

    var resMsg = {};

    switch (msg.msgType) {
        case "text" :
            // 返回文本消息
            resMsg = {
                fromUserName : msg.toUserName,
                toUserName : msg.fromUserName,
                msgType : "text",
                content : "这是文本回复",
                funcFlag : 0
            };
            break;

        case "音乐" :
            // 返回音乐消息
            resMsg = {
                fromUserName : msg.toUserName,
                toUserName : msg.fromUserName,
                msgType : "music",
                title : "音乐标题",
                description : "音乐描述",
                musicUrl : "音乐url",
                HQMusicUrl : "高质量音乐url",
                funcFlag : 0
            };
            break;

        case "图文" :

            var articles = [];
            articles[0] = {
                title : "PHP依赖管理工具Composer入门",
                description : "PHP依赖管理工具Composer入门",
                picUrl : "http://weizhifeng.net/images/tech/composer.png",
                url : "http://weizhifeng.net/manage-php-dependency-with-composer.html"
            };

            articles[1] = {
                title : "八月西湖",
                description : "八月西湖",
                picUrl : "http://weizhifeng.net/images/poem/bayuexihu.jpg",
                url : "http://weizhifeng.net/bayuexihu.html"
            };

            articles[2] = {
                title : "「翻译」Redis协议",
                description : "「翻译」Redis协议",
                picUrl : "http://weizhifeng.net/images/tech/redis.png",
                url : "http://weizhifeng.net/redis-protocol.html"
            };

            // 返回图文消息
            resMsg = {
                fromUserName : msg.toUserName,
                toUserName : msg.fromUserName,
                msgType : "news",
                articles : articles,
                funcFlag : 0
            }
    }

    weixin.sendMsg(resMsg);
});

weixin.imageMsg(function(msg) {
    console.log("imageMsg received");
    console.log(JSON.stringify(msg));
    var dirname = '/tmp/' + msg.fromUserName
    util.mkdir(dirname, function(err){
        if(err){
            console.log(err)
        }
    })

    var pre_token = moment().format('YYYYMMDDHHmmss') + msg.msgId
    var options = ''
    var output = dirname + '/' +  pre_token + '.jpg'
    var download = wget.download(msg.picUrl, output, options);
    download.on('error', function(err) {
        console.log(err);
    })
    download.on('end', function(output) {
        console.log(output);
    });
    _pic = new pic({
        UserName: msg.fromUserName,
        PicUrl:output
    })
    _pic.save(function(err,pic){
        if(err){
            console.log(err)
        } 
        console.log(pic)
        
    })
    resMsg = {
                fromUserName : msg.toUserName,
                toUserName : msg.fromUserName,
                msgType : "text",
                content : "下载成功",
                funcFlag : 0
            };
   weixin.sendMsg(resMsg)

});

weixin.voiceMsg(function(msg) {
    console.log("voiceMsg received");
    console.log(JSON.stringify(msg));
});


// 监听位置消息
weixin.locationMsg(function(msg) {
    console.log("locationMsg received");
    console.log(JSON.stringify(msg));
});

// 监听链接消息
weixin.urlMsg(function(msg) {
    console.log("urlMsg received");
    console.log(JSON.stringify(msg));
});

// 监听事件消息
weixin.eventMsg(function(msg) {
    console.log("eventMsg received");
    console.log(JSON.stringify(msg));
});

// Start
app.post('/', function(req, res) {
    // loop
    weixin.loop(req, res);

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
