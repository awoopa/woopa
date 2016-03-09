var db = require('../models');

module.exports = function (app, passport) {
  app.route('/u/:id')
    .get(function (req, res, next) {

      db.tx(t => {
        return t.batch([
          t.oneOrNone(`
            SELECT username, email
            FROM WoopaUser
            WHERE userID = $1`, 
            req.params.id
          ),
          t.any(`
            SELECT M.mediaID, M.title, U.userID, U.username, U.email
            FROM Recommends_To RT, WoopaUser U, Media M
            WHERE RT.recommendeeID = $1 AND
                  U.userID = RT.recommenderID AND
                  M.mediaID = RT.mediaID`,
            req.params.id
          ),
          t.any(`
            SELECT RWA.comment, RWA.rating, RWA.userID, M.mediaID
            FROM Review_Writes_About RWA, Media M
            WHERE RWA.userID = $1 AND
                  M.mediaID = RWA.mediaID`,
            req.params.id
          )
        ])
      })
      .then(data => {
        if (data[0]) {
          res.render('user', {
            user: data[0],
            recommendations: data[1],
            reviews: data[2]
          });
        } else {
          res.render('error', {
            message: "user not found"
          })
        }
      });


    });
};
