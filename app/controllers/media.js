var db = require('../models');

module.exports = function (app, passport) {
  app.route('/m/')
    .get((req, res, next) => {
      db.tx(t => {
        return t.batch([
          t.any(`
            SELECT *
            FROM Media
          `)
        ])
      })
      .then(data => {
        res.render('media-listing', {
          medias: data[0]
        });
      })
    });


  app.route('/m/:id')
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
            reviews: data[2],
            title: data[0].title
          });
        } else {
          res.render('error', {
            message: 'media not found'
          })
        }
      });


    });
};
