var manyvids = require('express').Router({ mergeParams: true });

// ManyVids Helper
const mv = require('../../manyvids.js');

// Webdriver Client Instance
const client = require('../../webdriverio/client.js').client;

// Test cookie - Pre-authenticated
const cookie =  require('cookie.json');

// Test Route
manyvids.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});

// route to trigger the capture
manyvids.get('/vids', function (req, res) {
  var id = req.params.id;
  console.log(`GET /vids - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
manyvids.get('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`Requesting Clip ID: ${id}`);
  // res.json({id});
  const params = {
    client: client,
    cookie: cookie
  };

  mv.login(params, function(err, data) {

    mv.editVid(id, params, function(err, data) {
      console.log(data);
      res.json(data);
    });

  });

});

// route to trigger the capture
manyvids.post('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`POST /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
manyvids.put('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`PUT /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
manyvids.delete('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`DELETE /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

module.exports = manyvids;
