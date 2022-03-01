/***
 * NodeJS module that implements the single pattern.
 * http://en.wikipedia.org/wiki/Singleton_pattern
 *
 * The goals is to create the object: instance only one time
 *  thus the instance is shared in the source code.
 *
 * You must be aware that there is a risk to break
 *  the isolation principles.
 */
const webdriverio = require('webdriverio');
const config = require('./config.js').config;

var client;
if (!global.instance) {
  var instance = {};
  instance.state = false;
  instance.func1 = function(state) {
    instance.state = state;
  };
  instance.client = webdriverio.remote(config);
  global.instance = instance;
}

exports.instance = global.instance;
