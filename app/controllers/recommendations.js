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
            WITH calc AS (
              SELECT M.mediaid AS mediaid, avg(RWA.rating) as avg, M.title as title, M.type as type  
                FROM Review_Writes_About RWA, Media M 
                WHERE RWA.mediaid = M.mediaid GROUP BY M.mediaid)

            SELECT M.*, I.*
            FROM Media M, Image I, 
              (SELECT R.mediaID FROM
                (SELECT M.type as type,  max(R.avg) AS mx 
                 FROM  Media M, calc R
                 WHERE R.mediaid = M.mediaid
                 GROUP BY M.type) AS A 
                JOIN calc R ON A.type = R.type AND A.mx = R.avg)  AS TRM
            WHERE M.imageID = I.ImageID AND
                  TRM.mediaID = M.mediaID`,
            // EXCEPT
            // SELECT M.*, I.*
            // FROM Recommends_To RT, Media M, WoopaUser U, Image I
            // WHERE RT.recommendeeID = 1 AND
            //       RT.mediaID = M.mediaID AND
            //       U.userID = RT.recommenderID AND
            //       M.imageID = I.ImageID`,
            [req.user.userid])
        ]);
      })
      .then(data => {
        // populate external recommendations
        console.log(data[0]);

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
              if (results[i].recommenderid == req.user.userid) {
                recs[j].selfRecommendation = true;
              }
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
              selfRecommendation: false,
              communityRecommendation: false,
              recommenders: [{
                email: results[i].email,
                username: results[i].username
              }]
            });
                  // check if user is recommending media to themself (e.g. watchlist)
              if (results[i].recommenderid == req.user.userid) {
                recs[j].selfRecommendation = true;
              }
          }
        }


        // populate system suggested media
        var suggested = data[1];

        for (var i = 0; i < suggested.length; i++) {
          var seen = false;
          for (var j = 0; j < recs.length; j++) {
            if (results[i].mediaid === recs[j].mediaid) {
              recs[j].communityRecommendation = true;
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
              selfRecommendation: false,
              communityRecommendation: true,
              recommenders: []
            });
            // check if user is recommending media to themself (e.g. watchlist)
            if (results[i].recommenderid == req.user.userid) {
              recs[j].communityRecommendation = true;
            }
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
