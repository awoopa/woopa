DROP TABLE IF EXISTS Actor CASCADE;
DROP TABLE IF EXISTS WoopaUser CASCADE;
DROP TABLE IF EXISTS Friends CASCADE;
DROP TYPE IF EXISTS mediaType CASCADE;
DROP TABLE IF EXISTS Media CASCADE;
DROP TABLE IF EXISTS Review_Writes_About CASCADE;
DROP TABLE IF EXISTS Watched CASCADE;
DROP TABLE IF EXISTS Appears_In CASCADE;
DROP TABLE IF EXISTS Recommends_To CASCADE;
DROP TABLE IF EXISTS UpdateRequest_Submits_On_Reviews CASCADE;

CREATE TABLE WoopaUser (
  userID    serial  UNIQUE NOT NULL,
  email     text    UNIQUE NOT NULL,
  username  text    UNIQUE NOT NULL,
  salt      text    NOT NULL,
  password  text    NOT NULL,
  isAdmin   boolean NOT NULL DEFAULT FALSE,
  PRIMARY KEY (userID)
);


CREATE TABLE Friends (
  user_userID    integer  NOT NULL REFERENCES WoopaUser (userID),
  friend_userID  integer  NOT NULL REFERENCES WoopaUser (userID),
  PRIMARY KEY (user_userID, friend_userID)
);


CREATE TYPE mediaType AS ENUM ('movie', 'tvshow', 'video');

CREATE TABLE Media (
  mediaID     serial    UNIQUE NOT NULL,
  title       text      NOT NULL,
  synopsis    text      NOT NULL,
  genre       text      NOT NULL,
  publishDate timestamptz      NOT NULL,
  rating      decimal,
  type        mediaType NOT NULL,
  runtime     integer   NULL,
  numSeasons  integer   NULL,
  numViews    integer   NULL,
  channel     text      NULL,
  img         bytea     NOT NULL,
  PRIMARY KEY (mediaID)
);


CREATE TABLE Review_Writes_About (
  reviewID    serial    UNIQUE NOT NULL,
  comment     text      NOT NULL,
  rating      integer   NOT NULL CHECK (rating >= 1 AND rating <= 10),
  userID      integer   NOT NULL REFERENCES WoopaUser (userID),
  mediaID     integer   NOT NULL REFERENCES Media (mediaID),
  timestamp   timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (reviewID)
);


CREATE TABLE Recommends_To (
  mediaID       integer NOT NULL REFERENCES Media (mediaID),
  recommenderID integer NOT NULL REFERENCES WoopaUser (userID),
  recommendeeID integer NOT NULL REFERENCES WoopaUser (userID),
  PRIMARY KEY (mediaID, recommenderID, recommendeeID)
);


CREATE TABLE Actor (
  actorName text NOT NULL,
  dob       timestamptz NOT NULL,
  PRIMARY KEY (actorName, dob)
);


CREATE TABLE Appears_In (
  mediaID   integer NOT NULL REFERENCES Media (mediaID),
  actorName text    NOT NULL,
  dob       timestamptz    NOT NULL,
  FOREIGN KEY (actorName, dob) REFERENCES Actor,
  PRIMARY KEY(mediaID, actorName, dob)
);


CREATE TABLE Watched (
  userID    integer   NOT NULL REFERENCES WoopaUser (userID),
  mediaID   integer   NOT NULL REFERENCES Media (mediaID),
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY(userID, mediaID)
);

CREATE TABLE UpdateRequest_Submits_On_Reviews (
  updateID      serial    UNIQUE NOT NULL,
  submitterID   integer   NOT NULL REFERENCES WoopaUser (userID),
  mediaID       integer   NOT NULL REFERENCES Media (mediaID),
  reviewerID    integer   REFERENCES WoopaUser (userID),
  details       text      NOT NULL,
  PRIMARY KEY(updateID)
);

