var db = require('../models');

module.exports = function (app, passport) {
  app.route('/u/:id')
    .get((req, res, next) => {

      db.tx(t => {
        var queries = [
          t.oneOrNone(`
            SELECT username, email, userid
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
          ),
          t.any(`
            SELECT M.mediaID, M.title
            FROM Watched W, Media M
            WHERE W.mediaID = M.mediaID AND
                  W.userID = $1`,
            req.params.id
          ),
          t.any(`
            SELECT *
            FROM Friends F, WoopaUser W
            WHERE F.user_userID=$1 AND
                  F.friend_userID = W.userID`,
            req.params.id),
          t.any(`
            SELECT M.*, I.img 
            FROM Recommends_To RT, Media M, Image I 
            WHERE M.imageID = I.imageID AND
                  RT.recommenderID = $1 AND
                  RT.recommendeeID = $1 AND
                  RT.mediaID = M.mediaID`,
            req.params.id)
        ];

        if (req.user) {
          queries.push(t.oneOrNone(`
            SELECT *
            FROM Friends
            WHERE user_userID = $1 AND
                  friend_userID = $2`,
            [req.user.userid, req.params.id]));
          queries.push(t.oneOrNone(`
            SELECT userid
            FROM WoopaUser
            WHERE userID = $1`,
            [req.user.userid, req.params.id]));
        }

        console.log(queries);

        return t.batch(queries);
      }).then(data => {
        
        if (data[0]) {
          for (var i = 0; i < data[5].length; i++) {
          var base64String = new Buffer(data[5][i].img, 'hex').toString('base64');
          base64String = "data:image/png;base64," + base64String;
          data[5][i].img = base64String;
        }

          var values = {
            user: data[0],
            recommendations: data[1],
            reviews: data[2],
            watched: data[3],
            friends: data[4],
            watchlist: data[5]
          };

          if (data[6]) {
            values.are_friends = true;
          } else {
            values.are_friends = false;
          }

          if (req.user && req.user.userid == req.params.id){
              values.is_self = true;
            } else {
              values.is_self = false;
            }
        

          res.render('user', values);
        } else {
          res.render('error', {
            message: "user not found"
          });
        }
      });
    });


  app.route('/u/search')
    .post((req, res, next) => {
      db.tx(t => {
        return t.batch([
          t.any(`
            SELECT *
            FROM WoopaUser
            WHERE username LIKE $1`,
            [`%${req.body.comment}%`])
        ]);
      }).then(data => {

        console.log(data);

        if (data[0]) {
          var values = {
            results: data[0],
            searchString: req.body.comment
          };

          res.render('search', values);
        } else {
          res.render('error', {
            message: 'user not found'
          })
        }
      }).catch(error => {
        console.log(error);
      });
    });

  app.route('/u/:id/add')
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
            FROM Friends
            WHERE user_userID = $1 AND
                  friend_userID = $2`,
            [req.user.userid, req.params.id])
        ]);
      }).then(data => {
        if (data[0]) {
          res.redirect(`/u/${req.params.id}`);
        } else {
          db.tx(t => {
            return t.batch([
              t.any(`
                INSERT INTO Friends
                (user_userID, friend_userID) values($1, $2)`,
                [req.user.userid, req.params.id])
            ]);
          }).then(data => {
            res.redirect(`/u/${req.params.id}`);
          }).error(err => {
            console.log(error);
          });
        }
      });
    });

  app.route('/u/:id/remove')
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
            FROM Friends
            WHERE user_userID = $1 AND
                  friend_userID = $2`,
            [req.user.userid, req.params.id])
        ]);
      }).then(data => {
        if (data[0]) {
          db.tx(t => {
            return t.batch([
              t.any(`
                DELETE FROM Friends
                WHERE user_userID = $1 AND
                      friend_userID = $2`,
                [req.user.userid, req.params.id])
            ]);
          }).then(data => {
            res.redirect('/u/' + req.params.id);
          }).error(err => {
            console.log(err);
          });
        } else {
          res.redirect('/u/' + req.params.id);
        }
      });
    });
};
