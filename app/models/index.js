var pg = require('pg'),
    config = require('../../config/config'),
    connectionString = process.env.DATABASE_URL || config.db;


var db = new pg.Client(connectionString);

db.connect();


module.exports = db;
