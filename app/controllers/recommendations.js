var db = require('../models');

module.exports = function(app) {
  var high = true;

  app.route('/recommendations/')
  .get((req, res, next) => {
    if (req.user) {
      next();
      var type = req.query.type;
      if (type === "low") {
        high = false;
      } else if (type === "high") {
        high = true;
      }
    } else {
      res.redirect('/login');
    }
  }, (req, res) => {
    db.tx(t => {
      return t.batch([
        t.any(`
          SELECT *
          FROM Recommends_To RT, Media M, WoopaUser U
          WHERE RT.recommendeeID = $1 AND
          RT.mediaID = M.mediaID AND
          U.userID = RT.recommenderID`,
          [req.user.userid]),

        // Highest rated media query
        t.any(`
          WITH calc AS (
            SELECT M.mediaid AS mediaid, avg(RWA.rating) as avg, M.title as title, M.type as type
            FROM Review_Writes_About RWA, Media M
            WHERE RWA.mediaid = M.mediaid GROUP BY M.mediaid)

          SELECT M.*
          FROM Media M,
          (SELECT C.mediaID FROM
            (SELECT M.type as type,  max(C.avg) AS mx
             FROM  Media M, calc C
             WHERE C.mediaid = M.mediaid
             GROUP BY M.type) AS A
            JOIN calc C ON A.type = C.type AND A.mx = C.avg)  AS TRM
          WHERE TRM.mediaID = M.mediaID`,
          [req.user.userid]),

        //Division query
        t.any(`
          WITH myfriends AS (
            SELECT F.friend_userID AS userID
            FROM Friends F
            WHERE F.user_userID=$1)

          SELECT M.*
          FROM Media M
          WHERE NOT EXISTS
          ((SELECT MF.userID
            FROM myfriends MF)
          EXCEPT
          (SELECT W.userID
            FROM Watched W
            WHERE W.mediaID = M.mediaID))`,
          [req.user.userid]),

        t.any(`
          SELECT F.friend_userID AS userID
          FROM Friends F
          WHERE F.user_userID=$1`,
          [req.user.userid]),
        
        // Lowest rated media query
        t.any(`
          WITH calc AS (
            SELECT M.mediaid AS mediaid, avg(RWA.rating) as avg, M.title as title, M.type as type
            FROM Review_Writes_About RWA, Media M
            WHERE RWA.mediaid = M.mediaid GROUP BY M.mediaid)

          SELECT M.*
          FROM Media M,
          (SELECT C.mediaID FROM
            (SELECT M.type as type,  min(C.avg) AS mx
             FROM  Media M, calc C
             WHERE C.mediaid = M.mediaid
             GROUP BY M.type) AS A
            JOIN calc C ON A.type = C.type AND A.mx = C.avg)  AS TRM
          WHERE TRM.mediaID = M.mediaID`,
          [req.user.userid])
      ]);
    })
    .then(data => {
      // populate external recommendations
      var results = data[0];
      var recs = [];
      results.forEach(result => {
        var seen = false;
        recs.forEach(rec => {
          if (result.mediaid === rec.mediaid) {
            // check if user is recommending media to themself (e.g. watchlist)
            if (result.recommenderid === req.user.userid) {
              rec.selfRecommendation = true;
            } else {
              rec.recommenders.push({
                email: result.email,
                username: result.username
              });
            }
            seen = true;
          }
        });
        if (!seen) {
          recs.push({
            mediaid: result.mediaid,
            title: result.title,
            synopsis: result.synopsis,
            genre: result.genre,
            publishdate: result.publishdate,
            rating: result.rating,
            img: `data:image/png;base64,${
              new Buffer(result.img, 'hex').toString('base64')
            }`,
            type: result.type,
            runtime: result.runtime,
            numseasons: result.numseasons,
            numviews: result.numviews,
            channel: result.channel,
            selfRecommendation: false,
            communityRecommendation: false,
            friendsRecommendation: false,
            recommenders: []
          });
          // check if user is recommending media to themself (e.g. watchlist)
          if (result.recommenderid === req.user.userid) {
            recs[recs.length - 1].selfRecommendation = true;
          } else {
            recs[recs.length - 1].recommenders.push({
              email: result.email,
              username: result.username
            });
          }
        }
      });

      // populate system suggested media - top rated media of each type
      var resultsC;
      if (high) {
        resultsC = data[1];
      } else {
        resultsC = data[4];
      }

      resultsC.forEach(result => {
        var seen = false;
        for (var j = 0; j < recs.length; j++) {
          if (result.mediaid === recs[j].mediaid) {
            recs[j].communityRecommendation = true;
            seen = true;
          }
        }

        if (!seen) {
          recs.push({
            mediaid: result.mediaid,
            title: result.title,
            synopsis: result.synopsis,
            genre: result.genre,
            publishdate: result.publishdate,
            rating: result.rating,
            img: `data:image/png;base64,${
              new Buffer(result.img, 'hex').toString('base64')
            }`,
            type: result.type,
            runtime: result.runtime,
            numseasons: result.numseasons,
            numviews: result.numviews,
            channel: result.channel,
            selfRecommendation: false,
            communityRecommendation: true,
            friendsRecommendation: false,
            recommenders: []
          });
          // check if user is recommending media to themself (e.g. watchlist)
          if (result.recommenderid === req.user.userid) {
            recs[recs.length - 1].selfRecommendation = true;
          }
        }
      });

      if (data[3].length !== 0) {
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
              recommenders: []});

            // check if user is recommending media to themself (e.g. watchlist)
            if (resultsF[i].recommenderid === req.user.userid) {
              recs[recs.length - 1].selfRecommendation = true;
            }
          }
        }
      }

      res.render('recommendations', {
        recommendations: recs,
        title: 'Recommendations'
      });
    }).catch(error => {
      console.log(error);
    });
  });
};

