var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
//日志模块
var logger = require('morgan');
//cookie处理插件
var cookieParser = require('cookie-parser');
//对post,请求体处理插件，使得req.body.xx可以获取参数
var bodyParser = require('body-parser');

var ejs = require("ejs");

// 引入为中间件
var index = require('./routes/index');
var users = require('./routes/users');
var goods = require('./routes/goods');
var app = express();

// 视图指向views目录
app.set('views', path.join(__dirname, 'views'));
//设置html引擎
app.engine('.html', ejs.__express);
//设置html视图引擎
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
/*使用中间件*/
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//静态资源托管
app.use(express.static(path.join(__dirname, 'public')));
/*登录拦截*/
app.use(function(req,res,next){
    //获取cookie
    if(req.cookies.userId){
        next();//转移控制权
    }else{
    //如果是点击“加入购物车”则进行拦截如,若是登录,退出,查询请求则不拦截，但是前端发送的查询请求是带参数的，且参数是动态的
    //故这里放行需要特殊处理，例如：请求时这里的req.originalUrl是/goods?page=1&pageSize=8&sort=1&busy=true&priceLevel=all
        if(req.originalUrl=="/users/register" || req.originalUrl=="/users/login"||req.originalUrl=="/users/logout"||req.path=="/goods/list"){
            next();
        }else{
            res.json({
                status:"1001",
                msg:"当前未登录",
                result:"",
            });
        }
    }
});
/*设置一级路由*/
//当后端访问“/” 加载index.js 文件，访问“/users”加载user.js 路由文件...
app.use('/', index);
app.use('/users', users);
app.use('/goods', goods);

// catch 404 and forward to error handler
/*捕获404*/
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
/*捕获err*/
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
