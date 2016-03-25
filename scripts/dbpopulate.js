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
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, numViews) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["Zirconium", "Shikib Sings Zirconium", "Comedy", new Date(2012, 11, 12), 10, 'video', 265]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, numViews) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["Asians + 1 Chat Simulator v1.0.0", "it took 11 months", "Comedy", new Date(2015, 5, 22), 10, 'video', 97]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, runtime) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["Zootopia", "In a city of anthropomorphic animals, a rookie bunny cop and a cynical con artist fox must work together to uncover a conspiracy.", "Action", new Date(2016, 2, 4), 8.4, 'movie', 108]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, numSeasons) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["Psych", "A novice sleuth is hired by the police after he cons them into thinking he has psychic powers which help solve crimes.", "Comedy", new Date(2006, 6, 7), 8.4, 'tvshow', 8]
      ),
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        ["the best!", 10, 1, 1]
      ),
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        ["the worst!", 1, 2, 1]
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


      
