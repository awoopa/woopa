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
        `INSERT INTO WoopaUser (email, username, salt, password, isAdmin) values($1, $2, $3, $4, $5)`,
        ["mparkms@gmail.com", "kaabistar", "salt", "hunter2", false]
      ),
      t.none(
        `INSERT INTO WoopaUser (email, username, salt, password, isAdmin) values($1, $2, $3, $4, $5)`,
        ["itsm@rk.us", "markus", "salt", "hunter2", false]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, numViews) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["Zirconium", "Shikib Sings Zirconium", "History", new Date(2012, 11, 12), 2, 'video', 265]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, numViews) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["My Moment", "The best rendition of the best song ever", "Music", new Date(2010, 08, 17), 1, 'video', 5201]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, numSeasons) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["Sailor Moonkib", "A lone algorithmicist defends the solar system from alien invasion", "Drama", new Date(1995, 05, 09), 7, 'tvshow', 8]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, runtime) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["Kyle and Abrar Go To White Castle", "First installment in the Kyle and Abrar series", "Comedy", new Date(2004, 07, 30), 9, 'movie', 92]
      ),
      t.none(
        `INSERT INTO Media (title, synopsis, genre, publishDate, rating, type, runtime) values($1, $2, $3, $4 ,$5, $6, $7)`,
        ["Kyle and Abrar Escape From Guantanamo Bay", "Second installment in the Kyle and Abrar series", "Comedy", new Date(2008, 04, 25), 8, 'movie', 106]
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
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        ["meh", 5, 3, 1]
      ),
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        [":^)", 5, 4, 1]
      ),
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        ["the best!", 10, 1, 3]
      ),
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        [":^)", 5, 4, 3]
      ),
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        ["wow this movie is so good!", 9, 2, 4]
      ),     
      t.none(
        `INSERT INTO Review_Writes_About (comment, rating, userID, mediaID) values($1, $2, $3, $4)`,
        ["this movie is definitely not a rip off of harold and kumar!", 9, 3, 4]
      ),    
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [1, 1, 2]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [1, 2, 1]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [1, 3, 1]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [1, 3, 4]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [1, 4, 2]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [1, 4, 1]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [3, 1, 2]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [3, 2, 1]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [3, 3, 1]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [4, 1, 2]
      ),
      t.none(
        `INSERT INTO Recommends_To (mediaID, recommenderID, recommendeeID) values($1, $2, $3)`,
        [4, 4, 3]
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


      
