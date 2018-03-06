require('dotenv').config({
  path: '.env.fififoxx'
});
const express = require('express');
const mv = require('./manyvids.js');
const middleware = require('./middleware/middleware.js');
const client = require('./webdriverio/client.js').client;

const app = express();

app.set('json spaces', 2);

// Add CORS headers
app.use(middleware.cors);

client
    .init();

const params = {
  client: client,
  cookie: cookie
};

// route to trigger the capture
app.get('/vids', function (req, res) {
  var id = req.params.id;
  console.log(`GET /vids - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
app.get('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`Requesting Clip ID: ${id}`);

  mv.editVid(id, params, function(err, data) {
    console.log(data);
    res.json(data);
  });

});

// route to trigger the capture
app.post('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`POST /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
app.put('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`PUT /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
app.delete('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`DELETE /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

app.listen(3000, function () {
  console.log('Express listening on port 3000');
});
