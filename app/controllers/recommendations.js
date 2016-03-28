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
            [req.user.userid]),
          t.any(`
            SELECT *
            FROM Media M, Image I, 
              (SELECT D.mediaID FROM
                (SELECT M.type as type,  max(C.avg) AS mx 
                 FROM  Media M, (SELECT M.mediaid AS mediaid, avg(RWA.rating) as avg, M.title as title, M.type as type  
                                 FROM Review_Writes_About RWA, Media M 
                                 WHERE RWA.mediaid = M.mediaid GROUP BY M.mediaid) as C 
                 WHERE C.mediaid = M.mediaid
                 GROUP BY M.type) 
              AS A JOIN (SELECT M.mediaid AS mediaid, avg(RWA.rating) as avg, M.title as title, M.type as type  
                                             FROM Review_Writes_About RWA, Media M 
                                             WHERE RWA.mediaid = M.mediaid GROUP BY M.mediaid) as D
              ON A.type = D.type AND A.mx = D.avg) as TRM
            WHERE M.imageID = I.ImageID AND
                  TRM.mediaID = M.mediaID`,
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
              recs[j].recommenders.push({
                email: results[i].email,
                username: results[i].username
              });

              // check if user is recommending media to themself (e.g. watchlist)
              if (results[i].email == req.user.email) {
                recs[j].selfRecommendation = true;
              }
              seen = true;
            }
          }

          if (!seen) {
            // check if user is recommending media to themself (e.g. watchlist)
            var selfRecommendation = false;
            if (results[i].email == req.user.email) {
              selfRecommendation = true;
            }

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
              selfRecommendation: selfRecommendation,
              recommenders: [{
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
