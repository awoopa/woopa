var db = require('../models');

module.exports = function (app, passport) {
  app.route('/login')
    .get(function (req, res, next) {
      res.render('login', {message: req.flash('loginMessage')});
    })
    .post(passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    }));
};
