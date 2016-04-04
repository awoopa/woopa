// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var db = require('../app/models');

// expose this function to our app using module.exports
module.exports = function(passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    // done(null, user.userID);
    console.log("serialize user: " + user);
    console.log(user);
    done(null, user.userid);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    db.one(`SELECT * FROM WoopaUser WHERE userID = $1`, id)
      .then(user => done(null, user))
      .catch(err => done(err, null));
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, (req, username, password, done) => {
    username = username.trim();
    password = password.trim();
    db.oneOrNone("SELECT * FROM WoopaUser WHERE username = $1", username)
    .then(user => {
      if (user) {
        return done(
          null,
          false,
          req.flash(
            'signupMessage',
            'That username is already taken.'
          ));
      }
      crypto.randomBytes(512, (err, salt) => {
        if (err) {
          throw err;
        }

        salt = new Buffer(salt).toString('hex');
        crypto.pbkdf2(password, salt, 10000, 512, (err, hashedPassword) => {
          if (err) {
            throw err;
          }

          hashedPassword = new Buffer(hashedPassword).toString('hex');

          db.one(
            `INSERT INTO WoopaUser(email, username, salt, password)
             VALUES($1, $2, $3, $4)
             RETURNING *`,
            [req.body.email, username, salt, hashedPassword])
            .then(user => {
              return done(null, user);
            })
            .catch(err => {
              throw err;
            });
        });
      });
    })
    .catch(err => {
      return done(err);
    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, (req, username, password, done) => { // callback with username and password from our form
    username = username.trim();
    password = password.trim();
    db.oneOrNone("SELECT * FROM WoopaUser WHERE username = $1", username)
    .then(user => {
      if (user) {
        crypto.pbkdf2(password, user.salt, 10000, 512, (err, hash) => {
          if (err) {
            throw err;
          }

          hash = new Buffer(hash).toString('hex');
          if (hash === user.password) {
            return done(null, user);
          }
          return done(
            null,
            false,
            req.flash(
              'loginMessage',
              'Incorrect password.'
            ));
        });
      } else {
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }
    })
    .catch(err => {
      return done(err);
    });
  }));
};
