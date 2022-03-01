const clips4sale = require('express').Router({
  mergeParams: true
});
const path = require('path');
const fs = require('fs');
const sales = require(path.join(__dirname, 'sales'))
const ftp = require(path.join(__dirname, 'ftp'))
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const spawn = require('child_process').spawn; // TODO Change to fork
var cp = require('child_process');

// clips4sale Helper
const c4s = require(path.join(__dirname, 'c4sHelper.js'));

// Webdriver Client Instance
// Webdriver Client Instance
var webdriverio = require('webdriverio');
var config = {
  desiredCapabilities: {
    browserName: 'chrome',
    chromeOptions: {
      binary: path.join(__dirname, '../../../../bin/chromedriver.exe')
    },
  },
  singleton: true, // Enable persistent sessions
  debug: true,
  // host: "http://127.0.0.1",
  // port: 4444
};
var client = webdriverio.remote(config);
// const client = require(path.join(__dirname, '../../webdriverio/client.js')).client;
// console.log(client);

try {
  if (fs.existsSync(path.join(__dirname, '../../../../webdriverio/client.js'))) {
    console.log('WebDriverIO Client Found!');
    //file exists
  }
} catch (err) {
  console.error(err)
  console.log('WDIO client not found.');
}
/* const webdriverio = require('webdriverio');
const config = {
  desiredCapabilities: {
    browserName: 'chrome',
	chromeOptions: {
		binary: path.join(__dirname, '../../../../bin/chromedriver.exe')
	},
  },
  singleton:true, // Enable persistent sessions
  debug: true,
  host: "http://127.0.0.1",
  port: 4444
};
var client = webdriverio.remote(config); */

console.log(path.join(__dirname, '../../../../bin/chromedriver.exe'));

// Test cookie - Pre-authenticated
// const cookie =  require('./cookie.json');

// Test Route
clips4sale.get('/', (req, res) => {
  res.status(200).json({
    message: 'Clips4Sale API'
  });
});

clips4sale.post('/spawn', jsonParser, (req, res) => {
  const event = req.body;
  var child = cp.fork(path.join(__dirname, 'postClip.js'), [JSON.stringify(event)]);
  // let child = spawn(
  // 	'node',
  // 	[
  //     path.join(__dirname, 'postClip.js'),
  //     JSON.stringify(event)
  //   ]
  // );
  // var buf = Buffer.from(JSON.stringify(event));
  // child.stdin.write(buf);
  // child.stdin.end();
  child.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
    // if (code === 0) {
    //    res.status(200).json({ message: 'WebDriverIO ran successfully.' });
    // }
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

// List Clips
clips4sale.get('/clips', function(req, res) {
  if (!req.header('X-Cookie')) {
    res.status(401).send('Missing X-Cookie Header');
  } else {
    const id = req.params.id;
    console.log(`GET /clips - Mock Endpoint`); // Mock
    res.json({});
  }
});

// route to trigger the capture
clips4sale.post('/clips', jsonParser, function(req, res) {
  if (!req.headers.authorization || req.headers.authorization.split(' ')[0] !== 'Bearer' || !req.header('X-Cookie')) {
    res.status(401).send('Missing Authentication Method.');
  } else {
    const event = req.body;
    const user = req.headers.authorization.split(' ')[1].split(':')[0];
    const pass = req.headers.authorization.split(' ')[1].split(':')[1];
    // console.log(JSON.stringify(event, null, 2)); // Mock
    const credentials = {
      user: user || event["credentials"][0]["c4s_username"] || process.env.C4S_USER,
      pass: pass || event["credentials"][0]["c4s_password"] || process.env.C4S_PASS,
      phpsessid: req.header('X-Cookie') || event["credentials"][0]["c4s_phpsessid"]
    };
    const params = {
      client: client,
      cookie: cookie
    };
    // console.log(credentials); // Debug
    c4s.login(credentials, params, function(err, data) {
      c4s.postClip(event, params, function(err, data) {
        console.log(data);
        res.json(data);
      });
    });
  }
});

// route to trigger the capture
clips4sale.get('/clips/:id', function(req, res) {
  if (!req.headers.authorization || req.headers.authorization.split(' ')[0] !== 'Bearer' || !req.header('X-Cookie')) {
    res.status(401).send('Missing Authentication Method.');
  } else {
    const id = req.params.id;
    console.log(`Requesting Clip ID: ${id}`);
    const user = req.headers.authorization.split(' ')[1].split(':')[0];
    const pass = req.headers.authorization.split(' ')[1].split(':')[1];
    const credentials = {
      user: user || event["credentials"][0]["c4s_username"] || process.env.C4S_USER,
      pass: pass || event["credentials"][0]["c4s_password"] || process.env.C4S_PASS,
      phpsessid: req.header('X-Cookie') || process.env.C4S_PHPSESSID || event["credentials"][0]["c4s_phpsessid"]
    };
    const params = {
      client: client
    };

    c4s.login(credentials, params, function(err, data) {
      c4s.getClip(id, params, function(err, data) {
        if (err) {
          console.log(err);
          res.send(401, err);
        } else {
          console.log(data);
          res.json(data);
        }
      });
    });
  }
});

// route to trigger the capture
clips4sale.put('/clips/:id', function(req, res) {
  if (!req.header('X-Cookie')) {
    res.status(401).send('Missing X-Cookie Header');
  } else {
    const id = req.params.id;
    console.log(`PUT /clips/${id} - Mock Endpoint`); // Mock
    res.json({});
  }
});

// route to trigger the capture
clips4sale.delete('/clips/:id', function(req, res) {
  if (!req.header('X-Cookie')) {
    res.status(401).send('Missing X-Cookie Header');
  } else {
    const id = req.params.id;
    console.log(`DELETE /clips/${id} - Mock Endpoint`); // Mock
    res.json({});
  }
});

/**
 * Clips4Sale Router
 * @type {String}
 */
clips4sale.use('/sales', sales);

clips4sale.use('/ftp', ftp);

module.exports = clips4sale;
