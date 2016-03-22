# woopa
World Online Organization of Pictures and Art


## Setup

- clone the repo and run ```npm install```
- set up your DB connection details in config/config.js
  - use the db connection string for now
- run ```npm run dbinit``` to create all the tables.
  WARNING: This WILL delete all existing tables.
- run ```npm run dbpopulate``` to populate the tables with sample data.
- run ```gulp``` to start the server. The Gulpfile is setup with Nodemon and LiveReload.

For syntax highlighting for Nunjucks in Sublime:
- Ensure Package Control is installed
- Open Command Palette, and select ```Package Control: Add Repository```
- Paste in ```https://github.com/andres-risso/sublime-nunjucks.git```
- Open Command Paletter, and select ```Package Control: Install Package```
- Select ```sublime-nunjucks```
- Open a ```.nunjucks``` file and choose View -> Syntax -> Open all with current extension as... -> Nunjucks