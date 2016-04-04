var db = require('../models');

module.exports = function(app) {
  app.route('/admin')
    .get((req, res, next) => {
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
    }, (req, res) => {
      db.tx(t => {
        return t.batch([
          t.any(`
          SELECT UR.updateID, UR.details, U.username, U.email, U.userID,
                 M.title, M.mediaID
          FROM UpdateRequest_Submits_On_Reviews UR,
               WoopaUser U, Media M
          WHERE UR.mediaID = M.mediaID AND
                UR.submitterID = U.userID`),
          t.any(`
            SELECT M.mediaID, M.title
            FROM Media M`)
        ]);
      }).then(data => {
        res.render('admin', {
          urs: data[0],
          medias: data[1],
          title: 'Admin'
        });
      });
    });
};
