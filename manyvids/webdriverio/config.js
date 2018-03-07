/**
 * WebDriverIO Configuration
 */
let debug = process.env.DEBUG;
const config = {
  desiredCapabilities: {
    browserName: 'chrome'
  },
  singleton:true, // Enable persistent sessions
  debug: debug,
  host: process.env.HOST || "http://localhost",
  port: process.env.PORT || 4444
};

module.exports = { config };
