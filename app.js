require('dotenv').config();
require('./src/db/mongo.js');
require('./src/models/User');
require('./src/models/Book');
require('./src/models/CustomBook');
require('./src/models/UserBook');
require('./src/models/UserVote');
require('./src/models/App');
require('./src/models/Category');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const requireAuth = require('./src/middlewares/requireAuth');

// routes
const auth = require('./src/routes/auth');
const index = require('./src/routes/index');
const books = require('./src/routes/books');
const data = require('./src/routes/data');
const appInfo = require('./src/routes/appInfo');
const categories = require('./src/routes/categories');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(auth);
app.use(appInfo);
app.use(requireAuth, data);
app.use('/', index);
app.use('/books', requireAuth, books);
app.use(requireAuth, categories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
