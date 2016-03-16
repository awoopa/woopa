var db = require('../models');

module.exports = function (app, passport) {

  app.route('/r/')
    .post((req, res, next) => {
      db.tx(t => {
        return t.batch([
          t.one(`INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values ($1, $2, $,3, $4)`,
            [req.body.comment, req.body.rating, req.user, req.body.mediaID])
        ])
      });
    })


  app.route('/r/:id')
    .get((req, res, next) => {

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
    })
/*    .put((req, res, next) => {
      db.tx(t => {
        return t.batch({
          t.one(`UPDATE `)
        });
      });
    })*/;
};
