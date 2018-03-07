const router = require('./routes');
require('dotenv').config({
  path: '.env.fififoxx'
});
const express = require('express');
const mv = require('./manyvids.js');
const middleware = require('./middleware/middleware.js');
var manyvidsRouter = express.Router();
const client = require('./webdriverio/client.js').client;

const app = express();
//  Connect all our routes to our application
app.use('/', router);

app.set('json spaces', 2);

// Add CORS headers
app.use(middleware.cors);

const params = {
  client: client,
  cookie: cookie
};

// route to trigger the capture
manyvidsRouter.get('/vids', function (req, res) {
  var id = req.params.id;
  console.log(`GET /vids - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
manyvidsRouter.get('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`Requesting Clip ID: ${id}`);

  mv.login(params, function(err, data) {

    mv.editVid(id, params, function(err, data) {
      // client.close();
      console.log(data);
      res.json(data);
    });

  });

});

// route to trigger the capture
manyvidsRouter.post('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`POST /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
manyvidsRouter.put('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`PUT /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
manyvidsRouter.delete('/vids/:id', function (req, res) {
  var id = req.params.id;
  console.log(`DELETE /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

app.use('/manyvids', manyvidsRouter);

app.listen(3000, function () {
  console.log('Express listening on port 3000');
});
