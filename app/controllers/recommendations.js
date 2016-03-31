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
              (SELECT C.mediaID FROM
                (SELECT M.type as type,  max(C.avg) AS mx 
                 FROM  Media M, calc C
                 WHERE C.mediaid = M.mediaid
                 GROUP BY M.type) AS A 
                JOIN calc C ON A.type = C.type AND A.mx = C.avg)  AS TRM
            WHERE M.imageID = I.ImageID AND
                  TRM.mediaID = M.mediaID`,
            // EXCEPT
            // SELECT M.*, I.*
            // FROM Recommends_To RT, Media M, WoopaUser U, Image I
            // WHERE RT.recommendeeID = 1 AND
            //       RT.mediaID = M.mediaID AND
            //       U.userID = RT.recommenderID AND
            //       M.imageID = I.ImageID`,
            [req.user.userid]),
          t.any(`
            WITH myfriends AS (
              SELECT F.friend_userID AS userID
              FROM Friends F
              WHERE F.user_userID=$1)

            SELECT M.*, I.*
            FROM Media M, Image I
            WHERE NOT EXISTS 
            ((SELECT MF.userID
              FROM myfriends MF)
              EXCEPT
              (SELECT W.userID
                FROM Watched W
                WHERE W.mediaID = M.mediaID)) AND M.imageID = I.ImageID`,
            [req.user.userid])
        ]);
      })
.then(data => {
        // populate external recommendations

        var results = data[0];
        var recs = [];
        for (var i = 0; i < results.length; i++) {
          var seen = false;
          for (var j = 0; j < recs.length; j++) {
            if (results[i].mediaid === recs[j].mediaid) {

              // check if user is recommending media to themself (e.g. watchlist)
              if (results[i].recommenderid == req.user.userid) {
                recs[j].selfRecommendation = true;
              } else {
                recs[j].recommenders.push({
                  email: results[i].email,
                  username: results[i].username
                });
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
              friendsRecommendation: false,
              recommenders: []
            });
          // check if user is recommending media to themself (e.g. watchlist)
          if (results[i].recommenderid == req.user.userid) {
            recs[recs.length-1].selfRecommendation = true;
          } else {
              recs[recs.length-1].recommenders.push({
                email: results[i].email,
                username: results[i].username
              });
            }
          }
        }

        // populate system suggested media - top rated media of each type
        var resultsC = data[1];

        for (var i = 0; i < resultsC.length; i++) {
          var seen = false;
          for (var j = 0; j < recs.length; j++) {
            if (resultsC[i].mediaid === recs[j].mediaid) {
              recs[j].communityRecommendation = true;
              seen = true;
            }
          }

          if (!seen) {

            recs.push({
              mediaid: resultsC[i].mediaid,
              title: resultsC[i].title,
              synopsis: resultsC[i].synopsis,
              genre: resultsC[i].genre,
              publishdate: resultsC[i].publishdate,
              rating: resultsC[i].rating,
              img: `data:image/png;base64,${
                new Buffer(resultsC[i].img, 'hex').toString('base64')
              }`,
              type: resultsC[i].type,
              runtime: resultsC[i].runtime,
              numseasons: resultsC[i].numseasons,
              numviews: resultsC[i].numviews,
              channel: resultsC[i].channel,
              selfRecommendation: false,
              communityRecommendation: true,
              friendsRecommendation: false,
              recommenders: []
            });
            // check if user is recommending media to themself (e.g. watchlist)
            if (resultsC[i].recommenderid == req.user.userid) {
              recs[j].selfRecommendation = true;
            }
          }
        }

        // populate system suggested media - media watched by all friends
        var resultsF = data[2];

        for (var i = 0; i < resultsF.length; i++) {
          var seen = false;
          for (var j = 0; j < recs.length; j++) {
            if (resultsF[i].mediaid === recs[j].mediaid) {
              recs[j].friendsRecommendation = true;
              seen = true;
            }
          }

          if (!seen) {

            recs.push({
              mediaid: resultsF[i].mediaid,
              title: resultsF[i].title,
              synopsis: resultsF[i].synopsis,
              genre: resultsF[i].genre,
              publishdate: resultsF[i].publishdate,
              rating: resultsF[i].rating,
              img: `data:image/png;base64,${
                new Buffer(resultsF[i].img, 'hex').toString('base64')
              }`,
              type: resultsF[i].type,
              runtime: resultsF[i].runtime,
              numseasons: resultsF[i].numseasons,
              numviews: resultsF[i].numviews,
              channel: resultsF[i].channel,
              selfRecommendation: false,
              communityRecommendation: false,
              friendsRecommendation: true,
              recommenders: []
            });
            // check if user is recommending media to themself (e.g. watchlist)
            if (resultsF[i].recommenderid == req.user.userid) {
              recs[j].selfRecommendation = true;
            }
          }
        }

        var values = {
          recommendations: recs,
          title: 'Recommendations'
        };

        res.render('recommendations', values);
      }).catch(function (error) {
        console.log(error); // printing the error 
    });
});
};

