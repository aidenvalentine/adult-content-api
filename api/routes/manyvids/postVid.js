const fs = require('fs');
const path = require('path');
const webdriverio = require('webdriverio');

// Webdriver Client Instance
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
const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"))
var event = JSON.parse(process.argv[2]);
var uploadCount = 0;

client
  .init().catch(function(err, params) {
    client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    console.log('WDIO.init() failed.');
    return callback(`WDIO.init() failed.`, {});
  })
  // .setCookie(cookie)
  .url('https://www.manyvids.com/Login/')
  // .waitForVisible('button.js-warning18-popup', 3000) // No longer pops up on manyvids login page
  // .click('button.js-warning18-popup')
  .setValue('#triggerUsername', conf.settings.manyvids.user)
  .setValue('#triggerPassword', conf.settings.manyvids.pass)
  .waitForVisible('body > div.mv-profile', 30000)
  // .click('#loginAccountSubmit')

  // Upload the file.
  .url(`https://www.manyvids.com/Upload-vids/`)
  .waitForVisible('#pickfiles', 30000)
  .execute(function(uploadCount) {
    uploadCount = $("div.action-link > a").length;
  }, uploadCount)
  .click('#pickfiles')
  // .chooseFile(`input[type="file"][0]`,localPath)

  // Wait for the Edit Page, then prefill
  .waitForVisible("li.js-upload-row > div > div > div > h5", 180000)
  // .execute(function(description) {
  //   "https://manyvids.com/" + $("div.action-link > a").attr("href");
  // })
  .waitUntil(() => {
    console.log("i.processing-upload-icon");
    return $("i.processing-upload-icon").length === 0
  }, 5000, 'expected text to be different after 5s')
  .execute(function() {
    UploadComplete
  })
  // .waitForVisible("body > div.mv-controls > div.video-player-edit-page", 1800000)
  .setValue('[name="video_title"]', event.name)
  .setValue('[name="video_description"]', event.description)
  // .pause(2000)
  // .chooseFile("#container > div > input", file)
  .getValue("#container > div > input").then(function(val) {
    console.log('File to Upload: ' + JSON.stringify(val));
  });
