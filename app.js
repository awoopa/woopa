var express = require('express');
var config = require('./config/config');
var app = express();

require('./config/express')(app, config);

var port = process.env.PORT || config.port;

app.listen(port, () => {
  console.log('Express server listening on port ' + port);
});
