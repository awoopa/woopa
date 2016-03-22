var db = require('../models');

module.exports = function (app, passport) {

  app.route('/r/')
    // need to check for authentication
    .post((req, res, next) => {
      console.log('POST review hit');
      console.log(req.body.comment);
      console.log(req.body.rating);
      console.log(req.user.userid);
      console.log(req.body.mediaID);
      db.tx(t => {
        return t.batch([
          t.one(`INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values ($1, $2, $3, $4) RETURNING *`,
            [req.body.comment, req.body.rating, req.user.userid, req.body.mediaID])
        ])
      }).then(data => {
        res.redirect(/m/ + req.body.mediaID);
      }).catch(error => {
        console.log(error);
      });
    });


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
