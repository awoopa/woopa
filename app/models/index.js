var pgp = require('pg-promise')({});
var config = require('../../config/config');
var connectionString = process.env.DATABASE_URL || config.db;

var db = pgp(connectionString);

module.exports = db;
