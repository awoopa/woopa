var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app, passport) {
  app.use('/', router);

  router.get('/', function (req, res, next) {
    db.any("SELECT * FROM WoopaUser", true)
      .then(users => {
        console.log(users);
        res.render('index', {
          title: 'Index',
          users: users
        });
      })
      .catch(err => {
        console.log(err);
        res.render('error', {
          message: err
        })
      })
  });

  router.get('/signup', function (req, res, next) {
    res.render('signup', {message: req.flash('signupMessage')});
  });

  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
  }));
};

