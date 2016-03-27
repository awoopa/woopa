var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app, passport) {
  app.use('/', router);
  router.get('/', function (req, res, next) {
    db.any("SELECT * FROM Media", true)
      .then(media => {
        console.log(media);
        res.render('index', {
          title: 'Index',
          media: media,
          loggedInUser: req.user
        });
      })
      .catch(err => {
        console.log(err);
        res.render('error', {
          status: 500,
          message: err
        })
      })
  });

  router.get('/', function (req, res, next) {
    db.any("SELECT * FROM WoopaUser", true)
      .then(users => {
        console.log(users);
        res.render('index', {
          title: 'Index',
          users: users,
          user: req.user
        });
      })
      .catch(err => {
        console.log(err);
        res.render('error', {
          status: 500,
          message: err
        })
      })
  });
};

