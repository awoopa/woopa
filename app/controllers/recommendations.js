var db = require('../models');

module.exports = function (app, passport) {
  app.route('/recommendations/')
    .get((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect('/login');
      }
    }, (req, res, next) => {

      var query = "SELECT * FROM Media";

      db.tx(t => {
        return t.batch([
          t.any(`
            SELECT *
            FROM Recommends_To RT, Media M, WoopaUser U
            WHERE RT.recommendeeID = $1 AND
                  RT.mediaID = M.mediaID AND
                  U.userID = RT.recommenderID`,
            [req.user.userid])
        ])
      })
      .then(data => {
        res.render('recommendations', {
          recommendations: data[0],
          title: 'Recommendations'
        });
      })
    });

 
};
