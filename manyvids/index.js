require('dotenv').config({
  path: '.env.manyvids'
});
const mv = require('./manyvids.js');
const webdriverio = require('webdriverio');
const options = {
  desiredCapabilities: {
    browserName: 'chrome'
  },
  host: process.env.HOST || "http://localhost",
  port: process.env.PORT || 4444
};
var client = webdriverio.remote(options);

// A pre-authenticated test cookie
var cookie = {"domain":".manyvids.com","expiry":1520927551.376236,"httpOnly":true,"name":"PHPSESSID","path":"/","secure":false,"value":"rb1kb7j0t2k1pbja6agg8trkd1"};

const params = {
  client: client,
  cookie: cookie
};

// Login to ManyVids and get our session cookie
mv.login(params, function(err, cookie) {
  console.log(process.argv[2]);
  var id = process.argv[2]; // Cli Arg (Is the "3rd" item in the process.argv array @see nodejs docs)

  mv.editVid(id, params, function(err, data) {
    console.log(data);
  });

});
