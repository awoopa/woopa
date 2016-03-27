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
        console.log(data);
        if (data[0]) {
          var values = {
            user: data[0],
            recommendations: data[1],
            reviews: data[2],
            watched: data[3]
          }

          if (data[4]) {
            values.are_friends = true;
          } else {
            values.are_friends = false;
          }

          if (data[5]) {
            if (values.user.userid == data[5].userid) {
              values.is_self = true;
            } else {
              values.is_self = false;
            }
          }

          res.render('user', values);
        } else {
          res.render('error', {
            message: "user not found"
          })
        }
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
          res.redirect('/u/' + req.params.id);
        } else {
          db.tx(t => {
            return t.batch([
              t.any(`
                INSERT INTO Friends 
                (user_userID, friend_userID) values($1, $2)`,
                [req.user.userid, req.params.id])
            ]);
          }).then(data => {
            res.redirect('/u/' + req.params.id);
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
