var pgp = require('pg-promise')({}),
    db = require('../app/models/index');



db.tx(function() {
  return this.batch([
      this.none(`DROP TABLE IF EXISTS Actor CASCADE;`),
      this.none(`DROP TABLE IF EXISTS WoopaUser CASCADE;`),
      this.none(`DROP TABLE IF EXISTS Friends CASCADE;`),
      this.none(`DROP TABLE IF EXISTS Media CASCADE;`),
      this.none(`DROP TABLE IF EXISTS Review_Writes_About CASCADE;`),
      this.none(`DROP TABLE IF EXISTS Watched CASCADE;`),
      this.none(`DROP TABLE IF EXISTS Appears_In CASCADE;`),
      this.none(`DROP TABLE IF EXISTS Recommends_To CASCADE;`),
      this.none(`DROP TABLE IF EXISTS UpdateRequest_Submits_On_Reviews CASCADE;`),


      this.none(`
        CREATE TABLE WoopaUser (
          userID    serial  UNIQUE NOT NULL,
          email     text    UNIQUE NOT NULL,
          username  text    UNIQUE NOT NULL,
          salt      text    NOT NULL,
          password  text    NOT NULL,
          isAdmin   boolean NOT NULL DEFAULT FALSE,
          PRIMARY KEY (userID)
        );
      `),
      this.none(`
        CREATE TABLE Friends (
          user_userID    integer  NOT NULL REFERENCES WoopaUser (userID),
          friend_userID  integer  NOT NULL REFERENCES WoopaUser (userID),
          PRIMARY KEY (user_userID, friend_userID)
        );
      `),
      this.none(`
        CREATE TABLE Media (
          mediaID     serial    UNIQUE NOT NULL,
          title       text      NOT NULL,
          synopsis    text      NOT NULL,
          genre       text      NOT NULL,
          publishDate date      NOT NULL,
          rating      decimal,
          thumbnail   text,
          type        integer   NOT NULL,
          runtime     integer   NULL,
          numSeasons  integer   NULL,
          numViews    integer   NULL,
          channel     text      NULL,
          PRIMARY KEY (mediaID)
        );
      `),
      this.none(`
        CREATE TABLE Review_Writes_About (
          reviewID    serial  UNIQUE NOT NULL,
          comment     text    NOT NULL,
          rating      integer NOT NULL,
          userID      integer NOT NULL REFERENCES WoopaUser (userID),
          mediaID     integer NOT NULL REFERENCES Media (mediaID),
          PRIMARY KEY (reviewID)
        );
      `),
      this.none(`
        CREATE TABLE Recommends_To (
          mediaID       integer NOT NULL REFERENCES Media (mediaID),
          recommenderID integer NOT NULL REFERENCES WoopaUser (userID),
          recommendeeID integer NOT NULL REFERENCES WoopaUser (userID),
          PRIMARY KEY (mediaID, recommenderID, recommendeeID)
        );
      `),
      this.none(`
        CREATE TABLE Actor (
          actorName text NOT NULL,
          dob       date NOT NULL,
          PRIMARY KEY (actorName, dob)
        );
      `),
      this.none(`
        CREATE TABLE Appears_In (
          mediaID   integer NOT NULL REFERENCES Media (mediaID),
          actorName text    NOT NULL,
          dob       date    NOT NULL,
          FOREIGN KEY (actorName, dob) REFERENCES Actor,
          PRIMARY KEY(mediaID, actorName, dob)
        );
      `),
      this.none(`
        CREATE TABLE Watched (
          userID    integer   NOT NULL REFERENCES WoopaUser (userID),
          mediaID   integer   NOT NULL REFERENCES Media (mediaID),
          timestamp timestamp NOT NULL,
          PRIMARY KEY(userID, mediaID)
        );
      `),
      this.none(`
        CREATE TABLE UpdateRequest_Submits_On_Reviews (
          updateID      serial    UNIQUE NOT NULL,
          submitterID   integer   NOT NULL REFERENCES WoopaUser (userID),
          mediaID       integer   NOT NULL REFERENCES Media (mediaID),
          reviewerID    integer   REFERENCES WoopaUser (userID),
          details       text      NOT NULL,
          PRIMARY KEY(updateID)
        );
      `)
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


      
