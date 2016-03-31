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
};
