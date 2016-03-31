module.exports = function(app, passport) {
  app.route('/login')
    .get((req, res) => {
      res.render('login', {message: req.flash('loginMessage')});
    })
    .post(passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    }));

  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });
};
