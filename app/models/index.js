var pgp = require('pg-promise')({}),
    config = require('../../config/config'),
    connectionString = process.env.DATABASE_URL || config.db;


var db = pgp(connectionString);


module.exports = db;
