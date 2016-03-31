var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var nunjucks = require('nunjucks');

var session = require('express-session');
var passport = require('passport');
var flash = require("connect-flash");

var prettyMs = require('pretty-ms');
var dateFilter = require('nunjucks-date-filter');

module.exports = function(app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env === 'development';

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'nunjucks');

  var crypto = require('crypto');

  nunjucks.configure(config.root + '/app/views', {
    autoescape: true,
    express: app
  }).addFilter('gravatar', (str, size) => { // TODO: move this somewhere else
    var s = `//www.gravatar.com/avatar/${
      crypto.createHash('md5').update(str).digest('hex')
    }`;
    if (size) {
      s += '?s=' + size;
    }
    return s;
  }).addFilter('approxtime', str => {
    return prettyMs(new Date() - new Date(str), {compact: true}).slice(1);
  }).addFilter('date', dateFilter);

  app.use(favicon(config.root + '/public/img/favicon/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  require('./passport')(passport);

  app.use(session({secret: "thisisareallybadsecret"}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
  });

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(controller => {
    require(controller)(app, passport);
    // require(controller)(app);
  });

  app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use((err, req, res) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });
};
