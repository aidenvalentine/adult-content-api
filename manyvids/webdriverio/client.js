const webdriverio = require('webdriverio');
const options = {
  desiredCapabilities: {
    browserName: 'chrome'
  },
  host: process.env.HOST || "http://localhost",
  port: process.env.PORT || 4444
};
var client = webdriverio.remote(options);

module.exports = { client };
