var path = require('path');
var rootPath = path.normalize(path.join(__dirname, '..'));
var env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'woopa'
    },
    port: 3000,
    db: 'postgres://woopa:woopa-development@localhost:5432/woopa-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'woopa'
    },
    port: 3000,
    db: 'postgres://localhost/woopa-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'woopa'
    },
    port: 3000,
    db: 'postgres://localhost/woopa-production'
  }
};

module.exports = config[env];
