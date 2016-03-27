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

      db.tx(t => {
        console.log("test test!!!");
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
        if (data[0]) {
          var values = {
            recommendations: data[0],
            title: 'Recommendations'
          }   

        res.render('recommendations', values);
      }
      })
    });
};
