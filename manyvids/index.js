require('dotenv').config({
  path: '.env.fififoxx'
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

mv.auth(client, function(err, cookie) {
  console.log(cookie);
  var cookie = {"domain":".manyvids.com","expiry":1520927551.376236,"httpOnly":true,"name":"PHPSESSID","path":"/","secure":false,"value":"rb1kb7j0t2k1pbja6agg8trkd1"};
  mv.getClip(client, cookie, function(err, data) {
    console.log(data);
  });
});
// mv.getClip();
