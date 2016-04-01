var db = require('../models');

module.exports = function(app) {
  app.route('/admin')
    .get((req, res, next) => {
      if (req.user.isadmin) {
        next();
      } else {
        res.redirect('/');
      }
    }, (req, res) => {
      db.tx(t => {
        return t.batch([

        ]);
      }).then(data => {
        res.render('admin', {
          data: data
        });
      });
    });
};
