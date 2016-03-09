var db = require('../models');

module.exports = function (app, passport) {
  app.route('/m/:id')
    .get(function (req, res, next) {

      db.tx(t => {
        return t.batch([
          t.oneOrNone(`
            SELECT * 
            FROM Media
            WHERE mediaID = $1`, 
            req.params.id
          ),
          t.one(`
            SELECT count(*)
            FROM Recommends_To
            WHERE mediaID = $1`,
            req.params.id 
          ),
          t.any(`
            SELECT RWA.comment, RWA.rating, RWA.userID, RWA.timestamp, U.userID, U.username, U.email
            FROM Review_Writes_About RWA, WoopaUser U
            WHERE RWA.mediaID = $1 AND
                  RWA.userID = U.userID`,
            req.params.id
          )
        ])
      })
      .then(data => {
        if (data[0]) {
          res.render('media', {
            media: data[0],
            recommendations: data[1].count,
            reviews: data[2]
          });
        } else {
          res.render('error', {
            message: 'media not found'
          })
        }
      });


    });
};
