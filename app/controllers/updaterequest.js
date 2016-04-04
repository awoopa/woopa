var db = require('../models');

module.exports = function(app) {
  app.route('/ur/')
    .post((req, res) => {
      db.tx(t => {
        return t.batch([
          t.one(`
            INSERT INTO UpdateRequest_Submits_On_Reviews
            (submitterID, mediaID, details)
            values ($1, $2, $3)
            RETURNING *`,
						[req.user.userid, req.body.mediaID, req.body.details])
        ]);
      }).then(() => {
        res.redirect(/m/ + req.body.mediaID);
      }).catch(error => {
        console.log(error);
      });
    });

   app.route('/ur/:id')
    .delete(isAdmin, (req, res) => {
      db.tx(t => {
        return t.none(`
          DELETE FROM UpdateRequest_Submits_On_Reviews WHERE updateID=$1`,
          req.params.id);
      }).then(() => {
        res.status(200);
        res.send('done');
      }).catch(err => {
        console.err(err);
        res.status(400);
        res.send('err: ' + err);
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
