// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
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
        done(null, user.userID);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      db.one(`SELECT * FROM WoopaUser WHERE userID = $1`, [id])
        .then(user => done(null, user))
        .catch(err => done(err));
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        db.oneOrNone("SELECT * FROM WoopaUser WHERE userID = $1", [username])
        .then(user => {
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
          } else {

            crypto.randomBytes(256, (err, salt) => {
              if (err) throw err;

              salt = new Buffer(salt).toString('hex');
              crypto.pkdf2(password, salt, 1000, 512, (err, hashedPassword) => {
                if (err) throw err;

                hashedPassword = new Buffer(hashedPassword).toString('hex');

                db.one(
                  'INSERT INTO WoopaUser(email, username, salt, password) VALUES($1, $2, $3) RETURNING userID',
                  [req.body.email, username, salt, hashedPassword])
                  .then(user => {return done(null, user)})
                  .catch(err => {throw err});
              })
            });

          }
        })
        .catch(err => {return done(err)});
    }));

};