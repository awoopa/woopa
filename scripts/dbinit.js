var pgp = require('pg-promise')({});
var db = require('../app/models/index');
var sqlCreateTables = sql('scripts/sql/dbinit.sql');

db.tx(t => {
  return t.none(sqlCreateTables);
})
.then(() => {
  console.log("DB initialized!");
  pgp.end();
})
.catch(err => {
  if (err) {
    console.log(err);
  }
  pgp.end();
});

function sql(file) {
  return new pgp.QueryFile(file, {debug: true, minify: true});
}
