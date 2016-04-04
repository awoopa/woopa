/* eslint new-cap: "off" */

var express = require('express');
var router = express.Router();
var db = require('../models');

module.exports = function(app) {
  app.use('/', router);
  router.get('/', (req, res) => {
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
        });
      });
  });

  router.get('/', (req, res) => {
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
        });
      });
  });
};

