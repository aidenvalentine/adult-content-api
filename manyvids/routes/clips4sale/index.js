var clips4sale = require('express').Router({ mergeParams: true });
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// clips4sale Helper
const c4s = require('./c4sHelper.js');

// Webdriver Client Instance
const client = require('../../webdriverio/client.js').client;

// Test cookie - Pre-authenticated
const cookie =  require('./cookie.json');

// Test Route
clips4sale.get('/', (req, res) => {
  res.status(200).json({ message: 'Clips4Sale Router!' });
});

// route to trigger the capture
clips4sale.get('/clips', function (req, res) {
  var id = req.params.id;
  console.log(`GET /clips - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
clips4sale.post('/clips', jsonParser, function (req, res) {
  var event = req.body;
  console.log(`POST /clips - Mock Endpoint`); // Mock
  console.log(JSON.stringify(event, null, 2)); // Mock
  // res.json({}); // Mock Response
  var credentials = {
    user: process.env.C4S_USER,
    pass: process.env.C4S_PASS
  };
  const params = {
    client: client,
    cookie: cookie
  };
  c4s.login(credentials, params, function(err, data) {
    c4s.postClip(event, params, function(err, data) {
      console.log(data);
      res.json(data);
    });
  });
});

// route to trigger the capture
clips4sale.get('/clips/:id', function (req, res) {
  var id = req.params.id;
  console.log(`Requesting Clip ID: ${id}`);
  // res.json({id});
  var credentials = {
    user: process.env.C4S_USER,
    pass: process.env.C4S_PASS
  };
  const params = {
    client: client,
    cookie: cookie
  };

  c4s.login(credentials, params, function(err, data) {

    c4s.getClip(id, params, function(err, data) {
      console.log(data);
      res.json(data);
    });

  });

});

// route to trigger the capture
clips4sale.put('/clips/:id', function (req, res) {
  var id = req.params.id;
  console.log(`PUT /clips/${id} - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
clips4sale.delete('/clips/:id', function (req, res) {
  var id = req.params.id;
  console.log(`DELETE /clips/${id} - Mock Endpoint`); // Mock
  res.json({});
});

module.exports = clips4sale;
