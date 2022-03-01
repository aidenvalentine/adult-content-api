var xvideos = require('express').Router({
  mergeParams: true
});
// var sales = require('./sales')
// var ftp = require('./ftp')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const path = require('path');
const spawn = require('child_process').spawn; // TODO Change to fork
var cp = require('child_process');

// clips4sale Helper
const xv = require('./xvHelper.js');

// Webdriver Client Instance
const client = require('../../webdriverio/client.js').client;

// Test cookie - Pre-authenticated
// const cookie =  require('./cookie.json');

// Test Route
xvideos.get('/', (req, res) => {
  res.status(200).json({
    message: 'Xvideos Router!'
  });
});

// route to trigger the capture
xvideos.get('/uploads', function(req, res) {
  var id = req.params.id;
  console.log(`GET /uploads - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
xvideos.post('/uploads', jsonParser, function(req, res) {
  var event = req.body;
  console.log(`POST /uploads - Mock Endpoint`); // Mock
  console.log(JSON.stringify(event, null, 2)); // Mock
  // res.json({}); // Mock Response
  var credentials = {
    user: conf.settings.xvideos.user,
    pass: conf.settings.xvideos.pass
  };
  const params = {
    client: client,
    cookie: cookie
  };
  xv.login(credentials, params, function(err, data) {
    xv.postUpload(event, params, function(err, data) {
      console.log(data);
      res.json(data);
    });
  });
});

xvideos.post('/spawn', jsonParser, (req, res) => {
  const event = req.body;
  var child = cp.fork(path.join(__dirname, 'postVideo.js'), [JSON.stringify(event)]);
  // let child = spawn(
  // 	'node',
  // 	[
  //     path.join(__dirname, 'postVideo.js'),
  //     JSON.stringify(event)
  //   ]
  // );
  child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
    if (code === 0) {
      // res.status(200).json({ message: 'WebDriverIO ran successfully.' });
    } else {
      // res.status(400).json({ message: 'Error code '+code });
    }
    // res.status(200).json({ message: 'xxxmultimedia.com Router!' });
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
xvideos.get('/uploads/:id', function(req, res) {
  var id = req.params.id;
  console.log(`Requesting Upload ID: ${id}`);
  // res.json({id});
  var credentials = {
    user: conf.settings.xvideos.user,
    pass: conf.settings.xvideos.pass
  };
  const params = {
    client: client,
    cookie: cookie
  };

  xv.login(credentials, params, function(err, data) {

    xv.getUpload(id, params, function(err, data) {
      console.log(data);
      res.json(data);
    });

  });

});

// route to trigger the capture
xvideos.put('/uploads/:id', function(req, res) {
  var id = req.params.id;
  console.log(`PUT /uploads/${id} - Mock Endpoint`); // Mock
  res.json({});
});

// route to trigger the capture
xvideos.delete('/uploads/:id', function(req, res) {
  var id = req.params.id;
  console.log(`DELETE /uploads/${id} - Mock Endpoint`); // Mock
  res.json({});
});

/**
 * Clips4Sale Router
 * @type {String}
 */
// xvideos.use('/sales', sales);

// xvideos.use('/ftp', ftp);

module.exports = xvideos;
