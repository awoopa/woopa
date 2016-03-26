var db = require('../models');

module.exports = function (app, passport) {


  app.route('/m/')
    .get((req, res, next) => {
      var type = req.query.type;

      var query = "SELECT * FROM Media";
      
      switch (type) {
        case "movie":
          query += " WHERE type = 'movie'";
          break;
        case 'tvshow':
          query += " WHERE type = 'tvshow'";
          break;
        case "video":
          query += " WHERE type = 'video'";
          break;
        default:
          break;
      }

      query += " ORDER BY rating DESC";

      db.tx(t => {
        return t.batch([
          t.any(query)
        ])
      })
      .then(data => {
        res.render('media-listing', {
          medias: data[0],
          title: 'Browse'
        });
      })
    });

  app.route('/m/:id')
    .get((req, res, next) => {

      db.tx(t => {
        var queries = [
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
        ];

        if (req.user) {
          queries.push(t.oneOrNone(`
            SELECT *
            FROM Watched
            WHERE userID = $1 AND
                  mediaID = $2`,
            [req.user.userid, req.params.id]));
          // want to get people who have current user as friend
          queries.push(t.any(`
            SELECT U.userID, U.email, U.username
            FROM Friends F, WoopaUser U
            WHERE F.friend_userID = $1 AND
                  F.user_userID = U.userID`, 
            req.user.userid));
        }

        return t.batch(queries);
      })
      .then(data => {
        if (data[0]) {
          var values = {
            media: data[0],
            recommendations: data[1].count,
            reviews: data[2],
            title: data[0].title
          }

          if (data[3]) {
            values.watched = true;
          } else {
            values.watched = false;
          }

          if (data[4]) {
            values.friends = data[4];
          }
          
          res.render('media', values);
        } else {
          res.render('error', {
            message: 'media not found'
          })
        }
      });
    });

  app.route('/m/:id/watched')
    .get((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect('/login');
      }
    }, (req, res, next) => {
      db.tx(t => {
        return t.batch([
          t.oneOrNone(`
            SELECT * 
            FROM Watched
            WHERE userID = $1 AND
                  mediaID = $2`,
            [req.user.userid, req.params.id])
        ]);
      }).then(data => {
        console.log(data);
        if (data[0]) {
          res.redirect('/m/' + req.params.id);
        } else {
          db.tx(t => {
            return t.batch([
              t.any(`
                INSERT INTO Watched
                (userID, mediaID) values($1, $2)`,
                [req.user.userid, req.params.id])
            ]);
          }).then(data => {
            console.log(data);
            res.redirect('/m/' + req.params.id);
          }).error(err => {
            console.log(err);
          });
        }
      });
    });

  app.route('/m/:id/recommend/:u')
    .get((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect('/login');
      }
    }, (req, res, next) => {
      db.tx(t => {
        return t.batch([
          t.oneOrNone(`
            SELECT *
            FROM Recommends_To
            WHERE mediaID = $1 AND
                  recommenderID = $2 AND
                  recommendeeID = $3`,
            [req.params.id, req.user.userid, req.params.u])
        ]).then(data => {
          if (data[0]) {
            res.redirect('/m/' + req.params.id);
          } else {
            db.tx(t => {
              return t.batch([
                t.none(`
                  INSERT INTO Recommends_To
                  values($1, $2, $3)`,
                  [req.params.id, req.user.userid, req.params.u])
              ]);
            }).then(() => {
                res.redirect('/m/' + req.params.id);
              }
            );
          }
        });
      });
    });
};
