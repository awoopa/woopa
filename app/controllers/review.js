var db = require('../models');

module.exports = function (app, passport) {

  app.route('/r/')
    // need to check for authentication
    .post((req, res, next) => {
      db.tx(t => {
        return t.batch([
          t.oneOrNone(`
            SELECT * 
            FROM Review_Writes_About 
            WHERE userID = $1 AND mediaID = $2`,
            [req.user.userid, req.body.mediaID])
        ]);
      }).then(data => {
        console.log(data);
        // if no review found for this media for this user
        if (data[0]) {
          res.redirect('/r/' + data[0].reviewid);         
        } else {
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
        }
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
            FROM Review_Writes_About
            WHERE reviewID = $1`, 
            req.params.id
          )
        ])
      })
      .then(data => {
        if (data[0]) {
          res.render('review', {
            review: data[0]
          });
        } else {
          res.render('error', {
            status: 404,
            message: 'media not found'
          })
        }
      });
    })
    .put((req, res, next) => {
      // update review
    })
    .delete((req, res, next) => {
      // delete review
    });
};
