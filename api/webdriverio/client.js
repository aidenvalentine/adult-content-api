const webdriverio = require('webdriverio');
const path = require('path');

/**
 * Initialized a new WebDriverIO Client.
 */
const config = require(path.join(__dirname, 'config.js')).config;
var client = webdriverio.remote(config);

module.exports = {
  client
};
