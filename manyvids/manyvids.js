/**
 * Login to ManyVids
 * @param  {webdriverio}   client   A webdriverio client
 * @param  {Function}      callback err, data
 * @return {Object}                 A webdriverio cookie containing the authenticated PHPSESSID
 */
function auth(client, callback) {
  client
    .init()
    .url('https://www.manyvids.com/Login/')
    .waitForVisible('button.js-warning18-popup', 3000)
    .click('button.js-warning18-popup')
    .setValue('#triggerUsername', process.env.USER)
    .setValue('#triggerPassword', process.env.PASS)
    .click('#loginAccountSubmit')
    .pause(15000)
    .getCookie('PHPSESSID').then(function(cookie) {
      console.log('Cookie is: ' + JSON.stringify(cookie));
      return cookie;
    })
    .next(function (data) {
      console.log(data);
      return callback(null, data);
    }).catch((e) => console.log(e));
};

function getClip(client, cookie, callback) {
  var data = {};
  data.video = {};
  data.website = "MANYVIDS";
  data.categories = [];

  client
    // .init()
    // .url('https://www.manyvids.com/Login/')
    // .waitForVisible('button.js-warning18-popup', 3000)
    // .click('button.js-warning18-popup')
    // .setValue('#triggerUsername', process.env.USER)
    // .setValue('#triggerPassword', process.env.PASS)
    // .click('#loginAccountSubmit')
    // .getCookie('PHPSESSID').then(function(cookie) {
    //   console.log('Cookie is: ' + JSON.stringify(cookie));
    // })
    // .setCookie({"domain":".manyvids.com","expiry":1520387523.912425,"httpOnly":true,"name":"PHPSESSID","path":"/","secure":false,"value":"o9ojvo25u7pnatbitmgief0j10"})
    // .pause(15000)
    // .url('https://www.manyvids.com/Edit-vid/' + req.params.id)
    .url('https://www.manyvids.com/Edit-vid/655248/')
    .pause(2000)
    .getAttribute('html', 'data-session-details').then(function(val) {
      console.log('Session Details: ' + JSON.stringify(val));
      data.session = JSON.parse(val);
      data.remoteStudioId = data.session.user_id;
    })
    .getAttribute('body', 'data-video-id').then(function(val) {
      console.log('Video ID: ' + JSON.stringify(val));
      data.video.id = val;
      data.remoteId = data.video.id;
    })
    .getAttribute('body', 'data-etag').then(function(val) {
      console.log('eTag: ' + JSON.stringify(val));
      data.video.etag = val;
    })
    .getAttribute('body', 'data-filename').then(function(val) {
      console.log('Filename: ' + JSON.stringify(val));
      data.video.filename = val;
    })
    .getValue('[name="video_cost"]').then(function(val) {
      console.log('Price is: ' + JSON.stringify(val*1));
      data.price = val*1;
    })
    .getValue('[name="video_title"]').then(function(val) {
      console.log('Title is: ' + JSON.stringify(val));
      data.name = val;
    })
    .getText('[name="video_description"]').then(function(val) {
      console.log('Title is: ' + JSON.stringify(val));
      data.description = val;
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[1]/input', 'value').then(function(val) {
      if(val) { data.categories.push(val); }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[2]/input', 'value').then(function(val) {
      if(val) { data.categories.push(val); }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[3]/input', 'value').then(function(val) {
      if(val) { data.categories.push(val); }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[4]/input', 'value').then(function(val) {
      if(val) { data.categories.push(val); }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[5]/input', 'value').then(function(val) {
      if(val) { data.categories.push(val); }
    })
    .getAttribute('[name="video_cost"]', 'value').then(function(val) {
      console.log('Price is: ' + JSON.stringify(val));
      data.price = val;
    })
    .getAttribute('.js-video-length', 'data-video-length').then(function(val) {
      data.lengthSeconds = val * 1;
      // data.lengthMinutes = val*1;
      console.log(data.lengthSeconds);
    })
    .getAttribute('//*[@id="rmpPlayer"]', 'data-video-filepath').then(function(val) {

      // var val = "https://dntgjk0do84uu.cloudfront.net/364438/e1a1813a9e1abe9866c0b74118081a58/preview/1520188436784.mp4_480_1520188447.m3u8"; // test string
      var regex = /https:\/\/.*\/.*\/(\d{13}).mp4_\d{3,4}_\d{10}.m3u8/; // Regex search string
      var match = regex.exec(val);
      var epochMs = match[1]; // Match regex group 1

      console.log(match, epochMs);
      console.log("Converting to UTC String");

      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      d.setUTCMilliseconds(epochMs); // set the dat obj to the video creatiume time in epoch ms
      data.createdAt = d.toISOString(); // Convert to UTC timestamp
    })
    .catch(function(err) {
      console.log('Local catch called');
    }).next(function() {
      console.log('Done!');
      console.log(JSON.stringify(data, null, 2));
      // return cb(null, formData);
    }).catch((e) => console.log(e));
};

module.exports = {
  auth,
  getClip
};
