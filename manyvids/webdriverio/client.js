/**
 * Initialized a new WebDriverIO Client.
 */
const webdriverio = require('webdriverio');
const config = require('./config.js').config;
var client = webdriverio.remote(config);

module.exports = { client };
