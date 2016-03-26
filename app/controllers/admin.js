var db = require('../models');

module.exports = function (app, passport) {
  app.route('/admin')
    .get((req, res, next) => {
      if (!req.user.isadmin) {
        res.redirect('/');
      } else {
        next();
      }
    }, (req, res, next) => {
      res.render('admin');
    });
};
