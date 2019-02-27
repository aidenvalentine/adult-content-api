const express = require('express');
const router = require('./routes');
const middleware = require('./middleware/middleware.js');
const app = express();

// Load ENV variables
require('dotenv').config({
  path: '.env.fififoxx'
  // path: 'prd.env.fififoxx'
});

//  Connect all our routes to our application
app.use('/', router);

// Pretty-Print JSON
app.set('json spaces', 2);

// Add CORS headers
app.use(middleware.cors);

app.listen(3000, function () {
  console.log('Express listening on port 3000');
});

module.exports = app;
