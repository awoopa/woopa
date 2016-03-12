var pgp = require('pg-promise')({}),
    db = require('../app/models/index');

db.tx(function(t) {
  return t.batch([
      t.none(
        `INSERT INTO WoopaUser (email, username, salt, password, isAdmin) values($1, $2, $3, $4, $5)`,
        ["jamesjhliu@gmail.com", "yeah568", "salt", "hunter2", true]
      ),
      t.none(
        `INSERT INTO WoopaUser (email, username, salt, password, isAdmin) values($1, $2, $3, $4, $5)`,
        ["wqi.william@gmail.com", "wqi", "salt", "hunter2", true]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type) values($1, $2, $3, $4 ,$5, $6)`,
        ["Zirconium", "Shikib Sings Zirconium", "Comedy", new Date(2012, 12, 12), 10, 'video']
      ),
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        ["the best!", 10, 1, 1]
      ),
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        ["the worst!", 0, 2, 1]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [1, 1, 2]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [1, 2, 1]
      )
    ])
  })
  .then(events => { 
    if(events) console.log(events);
    pgp.end();
  })
  .catch(err => { 
    if(err) console.log(error);
    pgp.end();
  });


      
