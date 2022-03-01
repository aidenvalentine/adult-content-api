var manyvids = require('express').Router({
  mergeParams: true
});
const path = require('path');
const spawn = require('child_process').spawn; // TODO Change to fork
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

// ManyVids Helper
const mv = require('./mvHelper.js');

// Webdriver Client Instance
const client = require('../../webdriverio/client.js').client;
const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));

// Test cookie - Pre-authenticated
// const cookie =  require('./cookie.json'); // for advanced auth only

/**
 * Test Route - Root
 * @type {String}
 */
manyvids.get('/', (req, res) => {
  res.status(200).json({
    message: 'ManyVids Router!'
  });
});

// route to trigger the capture
manyvids.get('/vids', function(req, res) {
  var id = req.params.id;
  console.log(`GET /vids - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
manyvids.get('/vids/:id', function(req, res) {
  var id = req.params.id;
  console.log(`Requesting Clip ID: ${id}`);
  // res.json({id});

  var credentials = {
    user: conf.settings.manyvids.user,
    pass: conf.settings.manyvids.pass
  };

  const params = {
    client: client,
    // cookie: cookie // For advanced cases
  };

  mv.login(credentials, params, function(err, data) {

    mv.getVid(id, params, function(err, data) {
      console.log(data);
      res.json(data);
    });

  });

});

// route to trigger the capture
manyvids.post('/vids', jsonParser, function(req, res) {
  const event = req.body;
  const credentials = {
    user: conf.settings.manyvids.user,
    pass: conf.settings.manyvids.pass
  };
  const params = {
    client: client,
    cookie: {
      "domain": ".manyvids.com",
      "httpOnly": true,
      "name": "PHPSESSID",
      "path": "/",
      "secure": false,
      "value": conf.settings.manyvids.phpsessid
    }
  };

  // mv.login(credentials, params, function(err, data) {

  mv.uploadVid(event, credentials, params, function(err, data) {
    if (err) {
      console.log(err);
    }
    console.log(data);
    res.json(data);
  });

  // });

});

manyvids.post('/spawn', jsonParser, (req, res) => {
  const event = req.body;
  let child = spawn(
    'node',
    [
      path.join(__dirname, 'postVid.js'),
      JSON.stringify(event)
    ]
  );
  child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
    if (code === 0) {
      res.status(200).json({
        message: 'WebDriverIO ran successfully.'
      });
    }
  });
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    // res.status(200).json(data);
  });
  child.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    // res.status(400).json(data);
  });
});

manyvids.put('/spawn', jsonParser, (req, res) => {
  const event = req.body;
  let child = spawn(
    'node',
    [
      path.join(__dirname, 'putVid.js'),
      JSON.stringify(event)
    ]
  );
  child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
    if (code === 0) {
      res.status(200).json({
        message: 'WebDriverIO ran successfully.'
      });
    }
  });
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    // res.status(200).json(data);
  });
  child.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    // res.status(400).json(data);
  });
});

// route to trigger the capture
manyvids.put('/vids/:id', jsonParser, function(req, res) {
  var id = req.params.id;
  console.log(`PUT /vids/${id} - Mock Endpoint`); // Mock
  console.log(req.header('X-Cookie')); // Mock
  const event = req.body;
  const credentials = {
    user: conf.settings.manyvids.user,
    pass: conf.settings.manyvids.pass
  };
  const params = {
    client: client,
    cookie: {
      "domain": ".manyvids.com",
      "httpOnly": true,
      "name": "PHPSESSID",
      "path": "/",
      "secure": false,
      "value": req.header('X-Cookie')
    }
  };

  // mv.login(credentials, params, function(err, data) {
  mv.login(credentials, params, function(err, data) {
    mv.postVid(id, event, params, function(err, data) {
      console.log(data);
      res.json(data);
    });
  });
});

// route to trigger the capture
manyvids.delete('/vids/:id', function(req, res) {
  var id = req.params.id;
  console.log(`DELETE /vids/${id} - Mock Endpoint`); // Mock
  res.json({});
});

module.exports = manyvids;
