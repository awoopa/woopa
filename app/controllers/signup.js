var db = require('../models');

module.exports = function (app, passport) {
  app.route('/signup')
    .get(function (req, res, next) {
      res.render('signup', {message: req.flash('signupMessage')});
    })
    .post(passport.authenticate('local-signup', {
      successRedirect: '/',
      failureRedirect: '/signup',
      failureFlash: true
    }));
};
