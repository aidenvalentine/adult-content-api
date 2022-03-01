(function() {
  'use strict';

  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const fs = require('fs');
  const router = require(path.join(__dirname, 'routes/'));
  const https = require('https');
  const app = express();
  const client = require('./webdriverio/client.js').client;

  app.use(function(req, res, next) {
    res.setHeader('X-Powered-By', 'ClipNuke.com')
    next()
  })

  app.use(cors());

  //  Connect all our routes to our application
  app.use('/', router);

  // Pretty-Print JSON
  app.set('json spaces', 2);

  https.createServer({
      key: fs.readFileSync(path.join(__dirname, 'server.key')),
      cert: fs.readFileSync(path.join(__dirname, 'server.cert')),
    }, app)
    .listen(3000, '127.0.0.1', function() {
      console.log('ClipNuke Server listening on port 3000! Go to https://localhost:3000/')
    })

  // This endpoint sends a signal to stop the server for the process refresh buttons,.
  app.get('/restart', function(req, res, next) {
    process.exit(1);
  });

  module.exports = app;

}());
