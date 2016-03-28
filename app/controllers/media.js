var db = require('../models');

module.exports = function (app, passport) {

  app.route('/m/')
    .get((req, res, next) => {
      var type = req.query.type;

      var query = "SELECT M.*, I.img FROM Media M, Image I WHERE M.imageID = I.imageID";
      
      switch (type) {
        case "movie":
          query += " AND type = 'movie'";
          break;
        case 'tvshow':
          query += " AND type = 'tvshow'";
          break;
        case "video":
          query += " AND type = 'video'";
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
        for (var i = 0; i < data[0].length; i++) {
          var base64String = new Buffer(data[0][i].img, 'hex').toString('base64');
          base64String = "data:image/png;base64," + base64String;
          data[0][i].img = base64String;
        }

        res.render('media-listing', {
          medias: data[0],
          title: 'Browse'
        });
      })
    });

  app.route('/m/search')
    .post((req, res, next) => {

      db.tx(t => {
        return t.batch([
          t.any(`
            SELECT M.*, I.img 
            FROM Media M, Image I 
            WHERE M.imageID = I.imageID AND 
            LOWER(title) LIKE LOWER($1)`,
            [`%${req.body.comment}%`])
        ]);
      }).then(data => {

        console.log(data);

        if (data[0]) {

          for (var i = 0; i < data[0].length; i++) {
          var base64String = new Buffer(data[0][i].img, 'hex').toString('base64');
          base64String = "data:image/png;base64," + base64String;
          data[0][i].img = base64String;
        }

          var values = {
          medias: data[0],
          title: 'Search for' + req.body.comment
          }

          res.render('media-listing', values);
        } else {
          res.render('error', {
            message: "user not found"
          })
        }
      }).catch(error => {
        console.log(error);
      });
    });

  app.route('/m/:id')
    .get((req, res, next) => {

      db.tx(t => {
        var queries = [
          t.oneOrNone(`
            SELECT M.*, I.img 
            FROM Media M, Image I 
            WHERE M.imageID = I.imageID AND
            mediaID = $1`, 
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
          ),
          t.any(`
            SELECT actorName, dob
            FROM Appears_In
            WHERE mediaID = $1`,
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

          queries.push(t.oneOrNone(`
            SELECT *
            FROM Recommends_To
            WHERE mediaID = $1 AND
                  recommenderID = $2 AND
                  recommendeeID = $2`,
            [req.params.id, req.user.userid]));
        }

        return t.batch(queries);
      })
      .then(data => {
        if (data[0]) {

        var base64String = new Buffer(data[0].img, 'hex').toString('base64');
          base64String = "data:image/png;base64," + base64String;
          data[0].img = base64String;

                  console.log(data[0]);

          var values = {
            media: data[0],
            recommendations: data[1].count,
            reviews: data[2],
            actors: data[3],
            title: data[0].title
          }

          if (data[4]) {
            values.watched = true;
          } else {
            values.watched = false;
          }

          if (data[5]) {
            values.friends = data[5];
          }

          if (data[6]) {
            values.watchlisted = true;
          } else {
            values.watchlisted = false;
          }
          console.log(data[6]);
          console.log(values);
          
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
          db.tx(t => {
            return t.batch([
              t.none(`
                DELETE 
                FROM Watched
                WHERE userID = $1 AND
                mediaID = $2`,
                [req.user.userid, req.params.id])
            ]);
          }).then(() => {
            res.redirect('/m/' + req.params.id);
          });
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

// recommender and recomendee have the same id - recommend to self = watchlist
  app.route('/m/:id/watchlist')
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
                  recommendeeID = $2`,
            [req.params.id, req.user.userid])
        ]).then(data => {
          if (data[0]) {
            // if it is already there remove (remove from watchlist)
          db.tx(t => {
            return t.batch([
              t.none(`
                DELETE 
                FROM Recommends_To
                WHERE mediaID = $1 AND
                recommenderID = $2 AND
                recommendeeID = $2`,
                [req.params.id, req.user.userid])
            ]);
          }).then(() => {
            res.redirect('/m/' + req.params.id);
          });
        } else {
            db.tx(t => {
              return t.batch([
                t.none(`
                  INSERT INTO Recommends_To
                  values($1, $2, $2)`,
                  [req.params.id, req.user.userid])
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
