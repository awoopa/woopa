var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'woopa'
    },
    port: 3000,
    db: 'postgres://localhost/woopa-development'
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
