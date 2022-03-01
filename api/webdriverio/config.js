const path = require('path');

/**
 * WebDriverIO Configuration
 */
let debug = process.env.DEBUG;
const config = {
  capabilities: [{
    browserName: 'chrome'
  }],
  desiredCapabilities: {
    browserName: 'chrome',
    // seleniumAddress: 'http://localhost:4444/wd/hub',
    // 'w3c': false,
    chromeOptions: {
      binary: path.join(__dirname, '../bin/chromedriver.exe'),
      // binary: 'electron ' + __dirname,
      // 'w3c': false,
      args: [
        'user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53',
        'headless',
        // Use --disable-gpu to avoid an error from a missing Mesa
        // library, as per
        // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
        'disable-gpu',
        'no-sandbox',
        'disable-dev-shm-usage',
        'allow-insecure-localhost',
      ],
    }
  },
  singleton: true, // Enable persistent sessions
  debug: true,
  // host: "http://localhost",
  // port: 4444
};

module.exports = {
  config
};
