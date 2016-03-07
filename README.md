# woopa
World Online Organization of Pictures and Art


## Setup

- clone the repo and run ```npm install```
- set up your DB connection details in config/config.js
  - use the db connection string for now
- run ```npm run dbinit``` to create all the tables.
  WARNING: This WILL delete all existing tables.
- run ```npm run dbpopulate``` to populate the tables with sample data.
- run ```npm start``` to start the server.