var db = require('../models');

var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({storage: storage});

module.exports = function(app) {
  app.route('/m/')
    .get((req, res) => {
      var type = req.query.type;

      var query = `
      SELECT *
      FROM Media`;

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

      query += " ORDER BY rating DESC NULLS LAST";

      db.tx(t => {
        return t.batch([
          t.any(query)
        ]);
      })
      .then(data => {
        for (var i = 0; i < data[0].length; i++) {
          data[0][i].img = `data:image/png;base64,${
            new Buffer(data[0][i].img, 'hex').toString('base64')
          }`;
        }

        res.render('media-listing', {
          medias: data[0],
          title: 'Browse'
        });
      });
    })
    .post(isAdmin, upload.single('image'), (req, res) => {
      db.tx(t => {
        var query;

        switch (req.body.type) {
          default:
          case 'movie':
            query = t.none(`
            INSERT INTO Media
            (title, synopsis, genre, publishDate,
            rating, type, runtime, img)
            values($1, $2, $3, $4, $5, $6, $7, $8)`, [
              req.body.title,
              req.body.synopsis,
              req.body.genre,
              new Date(req.body.publishDate),
              0,
              req.body.type,
              req.body.runtime,
              req.file.buffer
            ]);
            break;
          case 'tvshow':
            query = t.none(`
            INSERT INTO Media
            (title, synopsis, genre, publishDate,
            rating, type, numSeasons, img)
            values($1, $2, $3, $4, $5, $6, $7, $8)`, [
              req.body.title,
              req.body.synopsis,
              req.body.genre,
              new Date(req.body.publishDate),
              0,
              req.body.type,
              req.body.numSeasons,
              req.file.buffer
            ]);
            break;
          case 'video':
            query = t.none(`
            INSERT INTO Media
            (title, synopsis, genre, publishDate,
            rating, type, numSeaons, channel, img)
            values($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
              req.body.title,
              req.body.synopsis,
              req.body.genre,
              new Date(req.body.publishDate),
              0,
              req.body.type,
              req.body.numViews,
              req.body.channel,
              req.file.buffer
            ]);
            break;
        }
        return t.batch([query]);
      }).then(() => {
        res.redirect('/m');
      }).catch(err => {
        console.error(err);
      });
    });

  app.route('/m/search')
    .post((req, res) => {
      db.tx(t => {
        var projectFields = ['mediaID'];

        for (var field in req.body.project) {
          if (req.body.project.hasOwnProperty(field)) {
            projectFields.push(field);
          }
        }

        var q = `
          SELECT ${projectFields.join(', ')}
          FROM Media M
          WHERE LOWER(title) LIKE LOWER($1)`;
        var values = [`%${req.body.comment}%`];

        console.log(req.body.constraints);

        var paramNum = 2;

        if (req.body.constraints) {
          req.body.constraints.forEach(e => {
            switch (e.valuetype) {
              case 'int':
                values.push(parseInt(e.value, 10));
                q += ` ${e.connective} ${e.not} ${e.field} ${e.comp} $${paramNum++}`;
                break;
              case 'float':
                values.push(parseFloat(e.value));
                q += ` ${e.connective} ${e.not} ${e.field} ${e.comp} $${paramNum++}`;
                break;
              case 'string':
                values.push(e.value);
                q += ` ${e.connective} ${e.not} ${e.field} ${e.comp} $${paramNum++}`;
                break;
              case 'none':
                q += ` ${e.connective} ${e.not} ${e.field} ${e.comp}`;
                break;
              default:
                break;
            }
          });
        }

        q += ` ORDER BY ${req.body.orderbyfield} ${req.body.orderbydir}`;

        console.log(q);
        console.log(values);
        return t.batch([
          t.any(q, values)
        ]);
      }).then(data => {
        if (data[0]) {
          for (var i = 0; i < data[0].length; i++) {
            data[0][i].img = `data:image/png;base64,${
              new Buffer(data[0][i].img, 'hex').toString('base64')
            }`;
          }

          var values = {
            medias: data[0],
            title: 'Search for' + req.body.comment
          };

          res.render('media-listing', values);
        } else {
          res.render('error', {
            message: "user not found"
          });
        }
      }).catch(error => {
        console.log(error);
        res.render('error', {
          status: 400,
          message: 'bad request'
        });
      });
    });

  app.route('/m/:id')
    .get((req, res) => {
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
            SELECT RWA.comment, RWA.rating, RWA.userID, RWA.timestamp,
                   U.userID, U.username, U.email
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
          data[0].img = `data:image/png;base64,${
            new Buffer(data[0].img, 'hex').toString('base64')
          }`;

          var values = {
            media: data[0],
            recommendations: data[1].count,
            reviews: data[2],
            actors: data[3],
            title: data[0].title
          };

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

          res.render('media', values);
        } else {
          res.render('error', {
            status: 404,
            message: 'media not found'
          });
        }
      });
    })
    .delete(isAdmin, (req, res) => {
      db.tx(t => {
        return t.none(`
          DELETE FROM Media WHERE mediaID=$1`,
          req.params.id);
      }).then(data => {
        console.log('delete successful' + data);
        res.status(200).json({
          success: true
        });
      }).catch(err => {
        console.log(err);
        res.status(400).json({
          success: false,
          err: err
        });
      });
    });

  app.route('/m/:id/watched')
    .get((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect('/login');
      }
    }, (req, res) => {
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
            res.render('error', {
              status: 500,
              message: err
            });
            console.error(err);
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
    }, (req, res) => {
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
            });
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
    }, (req, res) => {
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
            });
          }
        });
      });
    });

  app.route('/m/:id/edit')
    .get(isAdmin, (req, res) => {
      db.tx(t => {
        return t.oneOrNone(`
          SELECT *
          FROM Media
          WHERE mediaID = $1`,
          req.params.id);
      }).then(media => {
        if (media) {
          res.render('media-edit', {
            media: media
          });
        } else {
          res.status(404);
          res.render('error', {
            status: 400,
            message: 'not found'
          });
        }
      }).catch(err => {
        console.error(err);
        res.status(500);
        res.render('error', {
          status: 500,
          message: 'something broke',
          err: err
        });
      });
    })
    .post(isAdmin, upload.single('image'), (req, res) => {
      var fields = [];
      var values = [req.params.id];

      var i = 2;

      for (var field in req.body) { // eslint-disable-line guard-for-in
        fields.push(`${field} = $${i}`);
        if (req.body[field] === '') {
          values.push(null);
        } else {
          values.push(req.body[field]);
        }
        i++;
      }

      if (req.file) {
        console.log(req.file.buffer);
        fields.push(`img = $${i}`);
        values.push(req.file);
        i++;
      }

      var q = `UPDATE Media
          SET ${fields.join(', ')}
          WHERE mediaID = $1`;

      db.tx(t => {
        return t.none(q,
          values);
      }).then(() => {
        res.redirect(`/m/${req.params.id}`);
      }).catch(err => {
        res.render('error', {
          status: 500,
          err: err,
          message: 'something broke'
        });
      });
    });

  /**
   * Middleware for authenticating admin users
   * @param {object} req - request object
   * @param {object} res - response object
   * @param {function} next - next in middleware chain
   */
  function isAdmin(req, res, next) {
    if (req.user && req.user.isadmin) {
      next();
    } else {
      res.status(401);
      res.render('error', {
        status: 401,
        message: "unauthorized",
        error: {},
        title: 'error'
      });
    }
  }
};
