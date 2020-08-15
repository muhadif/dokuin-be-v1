var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const keypair = require('keypair');
const keyconfig = require('./helper/config');
const bodyParser = require("body-parser");


let pair = keypair();
console.log(pair.public);
console.log(pair.private);
keyconfig.set('publickey', pair.public);
keyconfig.set('privatekey', pair.private);

var usersRouter = require('./routes/users');
var documentRouter = require('./routes/document');
var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/document', documentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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
