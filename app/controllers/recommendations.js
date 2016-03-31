var db = require('../models');

module.exports = function(app) {
  app.route('/recommendations/')
    .get((req, res, next) => {
      if (req.user) {
        next();
      } else {
        res.redirect('/login');
      }
    }, (req, res) => {
      db.tx(t => {
        return t.batch([
          t.any(`
            SELECT *
            FROM Recommends_To RT, Media M, WoopaUser U, Image I
            WHERE RT.recommendeeID = $1 AND
                  RT.mediaID = M.mediaID AND
                  U.userID = RT.recommenderID AND
                  M.imageID = I.ImageID`,
            [req.user.userid])
        ]);
      })
      .then(data => {
        var results = data[0];

        var recs = [];
        for (var i = 0; i < results.length; i++) {
          var seen = false;
          for (var j = 0; j < recs.length; j++) {
            if (results[i].mediaid === recs[j].mediaid) {
              recs[j].recomenders.push({
                email: results[i].email,
                username: results[i].username
              });
              seen = true;
            }
          }

          if (!seen) {
            recs.push({
              mediaid: results[i].mediaid,
              title: results[i].title,
              synopsis: results[i].synopsis,
              genre: results[i].genre,
              publishdate: results[i].publishdate,
              rating: results[i].rating,
              img: `data:image/png;base64,${
                new Buffer(results[i].img, 'hex').toString('base64')
              }`,
              type: results[i].type,
              runtime: results[i].runtime,
              numseasons: results[i].numseasons,
              numviews: results[i].numviews,
              channel: results[i].channel,
              recomenders: [{
                email: results[i].email,
                username: results[i].username
              }]
            });
          }
        }

        var values = {
          recommendations: recs,
          title: 'Recommendations'
        };

        res.render('recommendations', values);
      });
    });
};
