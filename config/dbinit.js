var pgp = require('pg-promise')({}),
    config = require('./config'),
    connectionString = process.env.DATABASE_URL || config.db;

var db = pgp(connectionString);


db.tx(function() {
  return this.batch([
      this.none(`DROP TABLE IF EXISTS Actor;`),
      this.none(`DROP TABLE IF EXISTS WoopaUser;`),
      this.none(`DROP TABLE IF EXISTS Friends;`),

      this.none(`
      CREATE TABLE Actor (
        actorName text NOT NULL,
        dob       date NOT NULL,
        PRIMARY KEY (actorName, dob)
      );`),

      this.none(`
      CREATE TABLE WoopaUser (
        userID    serial  UNIQUE NOT NULL,
        email     text    UNIQUE NOT NULL,
        username  text    UNIQUE NOT NULL,
        password  text    NOT NULL,
        isAdmin   boolean NOT NULL,
        PRIMARY KEY (userID)
      );`),
      
      this.none(`
      CREATE TABLE Friends (
        user_userID    integer  NOT NULL REFERENCES WoopaUser (userID),
        friend_userID  integer  NOT NULL REFERENCES WoopaUser (userID),
        PRIMARY KEY (user_userID, friend_userID)
      );`)
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
