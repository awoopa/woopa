module.exports = function(app, passport) {
  app.route('/signup')
    .get((req, res) => {
      res.render('signup', {message: req.flash('signupMessage')});
    })
    .post(passport.authenticate('local-signup', {
      successRedirect: '/',
      failureRedirect: '/signup',
      failureFlash: true
    }));
};
