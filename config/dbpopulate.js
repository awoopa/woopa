var pgp = require('pg-promise')({}),
    db = require('../app/models/index');



db.tx(function(t) {
  return t.batch([
      t.none(
        `INSERT INTO WoopaUser (email, username, password, isAdmin) values($1, $2, $3, $4)`,
        ["wqi.william@gmail.com", "wqi", "hunter2", true]
      ),
      t.none(
        `INSERT INTO WoopaUser (email, username, password, isAdmin) values($1, $2, $3, $4)`,
        ["jamesjhliu@gmail.com", "yeah568", "hunter2", true]
      ),
      t.none(
        `INSERT INTO WoopaUser (email, username, password, isAdmin) values($1, $2, $3, $4)`,
        ["test@example.com", "test", "hunter2", false]
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


      
