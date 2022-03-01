const webdriverio = require('webdriverio');
const path = require('path');

/**
 * Initialized a new WebDriverIO Client.
 */
const config = require(path.join(__dirname, '..', '..', 'webdriverio/config.js')).config;
var client = webdriverio.remote(config);

/**
 * Login to ManyVids.
 * Init a new webdriverio session.
 * @param  {webdriverio}   client   A webdriverio client
 * @param  {Function}      callback err, data
 * @return {Object}                 A webdriverio cookie containing the authenticated PHPSESSID
 */
function auth(credentials, params, callback) {
  params.client
    .init().catch(function(err, params) {
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log('WDIO.init() failed.');
      return callback(`WDIO.init() failed.`, {});
    }, params)
    // .setCookie(params.cookie)
    .url('https://www.manyvids.com/Login/')
    // .waitForVisible('button.js-warning18-popup', 3000) // No longer pops up on manyvids login page
    // .click('button.js-warning18-popup')
    .setValue('#triggerUsername', credentials.user)
    .setValue('#triggerPassword', credentials.pass)
    .waitForVisible('body > div.mv-profile', 30000)
    // .click('#loginAccountSubmit')
    // .pause(15000) // Wait in case we need to solve a recaptcha.
    .next(function(data) {
      console.log(data);
      return callback(null, data);
    }).catch((e) => console.log(e));
};

/**
 * Edit Vid - Details
 * Sends a GET request to the server, using an authenticated webdriverio session, fetches the data, then ends the session.
 * NOTE: It's super important to use .end() method to end the browser session. Because {@link auth | auth} calls init() to open a new browser session.
 * IMPORTANT: If we don't run browser.end(), this app will fail when {@link getVid | getVid} or another method is called!
 * @param  {Integer}   id      A ManyVids Video ID
 * @param  {Object}   params   client, cookie
 * @param  {Function} callback [description]
 * @return {Object}            An object containing details about a ManyVids video.
 */
function getVid(id, params, callback) {
  var data = {};
  data.video = {};
  data.website = "MANYVIDS";
  data.categories = [];
  console.log(id, params);

  params.client
    .setCookie(params.cookie)
    .url(`https://www.manyvids.com/Edit-vid/${id}/`)
    .pause(2000)

    // Manyvids Session Details
    .getAttribute('html', 'data-session-details').then(function(val) {
      console.log('Session Details: ' + JSON.stringify(val));
      data.session = JSON.parse(val);
      data.remoteStudioId = data.session.user_id;
    })

    // ManyVids Video ID
    .getAttribute('body', 'data-video-id').then(function(val) {
      console.log('Video ID: ' + JSON.stringify(val));
      data.video.id = val;
      data.remoteId = data.video.id;
    })

    /** Local Error Callback
     * @todo Break on various errors
     * @return error message, {}
     */
    .catch(function(err) {
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log('Local catch called');
      return callback(`Video ID not found for user ${data.session.username}. Error fetching the vid details.`, {});
    })

    // AWS eTag
    .getAttribute('body', 'data-etag').then(function(val) {
      console.log('eTag: ' + JSON.stringify(val));
      data.video.etag = val;
    })

    // Trailer Filename
    .getAttribute('body', 'data-filename').then(function(val) {
      console.log('Filename: ' + JSON.stringify(val));
      data.video.filename = val;
    })

    // Price
    .getValue('[name="video_cost"]').then(function(val) {
      console.log('Price is: ' + JSON.stringify(val * 1));
      data.price = val * 1;
    }).catch(function(err) {
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log('Local catch called');
      return callback(`Video Cost not found for vid ID: ${id}. Error fetching the vid details.`, {});
    })


    // Video Title
    .getValue('[name="video_title"]').then(function(val) {
      console.log('Title is: ' + JSON.stringify(val));
      data.name = val;
    })

    // Description
    .getText('[name="video_description"]').then(function(val) {
      console.log('Title is: ' + JSON.stringify(val));
      data.description = val;
    })

    // Categories/"Tags"
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[1]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[2]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[3]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[4]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[5]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })

    // Video Length
    .getAttribute('.js-video-length', 'data-video-length').then(function(val) {
      console.log(val);
      if (val * 1) {
        data.lengthSeconds = val * 1;
      } else {
        data.length = val;
      }
    })

    // Intensity
    .execute(function(obj) {
      obj = jQuery('#intensity > option:selected')[0].value;
      return obj;
    }, data).then(function(obj) {
      console.log("Intensity", obj.value);
      data.intensity = obj.value;
    })

    // Sale/Discount %
    .execute(function(obj) {
      obj = jQuery('#sale > option:selected')[0].value;
      return obj;
    }, data).then(function(obj) {
      var discount = obj.value;
      console.log(`Discount ${discount}`);
      data.discount = discount;
      if (discount) {
        data.salePrice = data.price - ((discount / 100) * data.price);
      }
    })

    // Trailer URL
    .getAttribute('//*[@id="rmpPlayer"]', 'data-video-screenshot').then(function(val) {
      data.poster = val;
    })

    // Poster Img URL
    .getAttribute('//*[@id="rmpPlayer"]', 'data-video-filepath').then(function(val) {
      data.trailer = val;
    })

    /** CreatedAt Timestamp
     * Epoch milliseconds to UTC string
     */
    .getAttribute('//*[@id="rmpPlayer"]', 'data-video-filepath').then(function(val) {
      var epochMs = 0;
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      // var val = "https://dntgjk0do84uu.cloudfront.net/364438/e1a1813a9e1abe9866c0b74118081a58/preview/1520188436784.mp4_480_1520188447.m3u8"; // test string
      var regex = /https:\/\/.*\/.*\/(\d{13}).mp4_\d{3,4}_\d{10}.m3u8/; // Regex search string
      var regex2 = /https:\/\/s3.amazonaws.com\/manyvids-data\/php_uploads\/preview_videos\/.*\/(\d{13})_preview.mp4/; // Regex search string

      if (regex.test(val)) {
        var match = regex.exec(val);
        epochMs = match[1];
      } else if (regex2.test(val)) {
        var match = regex2.exec(val);
        epochMs = match[1];
      }

      // console.log(match, epochMs);
      // console.log("Converting to UTC String");
      d.setUTCMilliseconds(epochMs); // set the dat obj to the video creatiume time in epoch ms
      data.createdAt = d.toISOString(); // Convert to UTC timestamp
    })

    // Success Callback
    .next(function() {
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log('Done!');
      console.log(JSON.stringify(data, null, 2));
      return callback(null, data);
    })

    // Global Error Callback
    .catch((e) => {
      console.log(e);
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      return callback(e, {});
    });
};

/**
 * Put Vid - Details
 * @param  {Integer}   id      A ManyVids Video ID
 * @param  {Object}   params   client, cookie
 * @param  {Function} callback [description]
 * @return {Object}            An object containing details about a ManyVids video.
 */
function postVid(id, data, params, callback) {
  // var data = {};
  // data.video = {};
  // data.website = "MANYVIDS";
  // data.categories = [];
  console.log(id, data, params);
  var localPath = 'X:\\S3Gateway\\NeroMedia\\xxxmultimedia-downloads\\' + data.filename;

  params.client
    // .setCookie(params.cookie)
    .waitForVisible('body > div.mv-profile', 30000)
    .url(`https://www.manyvids.com/Edit-vid/${id}/`)
    .chooseFile(selector, localPath)
    .url(`https://www.manyvids.com/Edit-vid/${id}/`)
    .pause(2000)
    // Manyvids Session Details
    .getAttribute('html', 'data-session-details').then(function(val) {
      console.log('Session Details: ' + JSON.stringify(val));
      data.session = JSON.parse(val);
      data.remoteStudioId = data.session.user_id;
    })

    // ManyVids Video ID
    .getAttribute('body', 'data-video-id').then(function(val) {
      console.log('Video ID: ' + JSON.stringify(val));
      data.video.id = val;
      data.remoteId = data.video.id;
    })

    // AWS eTag
    .getAttribute('body', 'data-etag').then(function(val) {
      console.log('eTag: ' + JSON.stringify(val));
      data.video.etag = val;
    })

    // Trailer Filename
    .getAttribute('body', 'data-filename').then(function(val) {
      console.log('Filename: ' + JSON.stringify(val));
      data.video.filename = val;
    })

    // Price
    .getValue('[name="video_cost"]').then(function(val) {
      console.log('Price is: ' + JSON.stringify(val * 1));
      data.price = val * 1;
    })

    // Video Title
    .getValue('[name="video_title"]').then(function(val) {
      console.log('Title is: ' + JSON.stringify(val));
      data.name = val;
    })

    // Description
    .getText('[name="video_description"]').then(function(val) {
      console.log('Title is: ' + JSON.stringify(val));
      data.description = val;
    })

    // Categories/"Tags"
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[1]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[2]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[3]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[4]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })
    .getAttribute('//*[@id="videoSettings"]/div[1]/div/ul/li[5]/input', 'value').then(function(val) {
      if (val) {
        data.categories.push(val);
      }
    })

    // Video Length
    .getAttribute('.js-video-length', 'data-video-length').then(function(val) {
      console.log(val);
      if (val * 1) {
        data.lengthSeconds = val * 1;
      } else {
        data.length = val;
      }
    })

    // Intensity
    .execute(function(obj) {
      obj = jQuery('#intensity > option:selected')[0].value;
      return obj;
    }, data).then(function(obj) {
      console.log("Intensity", obj.value);
      data.intensity = obj.value;
    })

    /** Local Error Callback
     * @todo Break on various errors
     * @return error message, {}
     */
    .catch(function(err) {
      console.log('Local catch called');
      return callback("Error fetching the vid details.", {});
    })

    // Sale/Discount %
    .execute(function(obj) {
      obj = jQuery('#sale > option:selected')[0].value;
      return obj;
    }, data).then(function(obj) {
      var discount = obj.value;
      console.log(`Discount ${discount}`);
      data.discount = discount;
      if (discount) {
        data.salePrice = data.price - ((discount / 100) * data.price);
      }
    })

    // Trailer URL
    .getAttribute('//*[@id="rmpPlayer"]', 'data-video-filepath').then(function(val) {
      data.poster = val;
    })

    // Poster Img URL
    .getAttribute('//*[@id="rmpPlayer"]', 'data-video-screenshot').then(function(val) {
      data.trailer = val;
    })

    /** CreatedAt Timestamp
     * Epoch milliseconds to UTC string
     */
    .getAttribute('//*[@id="rmpPlayer"]', 'data-video-filepath').then(function(val) {
      var epochMs = 0;
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      // var val = "https://dntgjk0do84uu.cloudfront.net/364438/e1a1813a9e1abe9866c0b74118081a58/preview/1520188436784.mp4_480_1520188447.m3u8"; // test string
      var regex = /https:\/\/.*\/.*\/(\d{13}).mp4_\d{3,4}_\d{10}.m3u8/; // Regex search string
      var regex2 = /https:\/\/s3.amazonaws.com\/manyvids-data\/php_uploads\/preview_videos\/.*\/(\d{13})_preview.mp4/; // Regex search string

      if (regex.test(val)) {
        var match = regex.exec(val);
        epochMs = match[1];
      } else if (regex2.test(val)) {
        var match = regex2.exec(val);
        epochMs = match[1];
      }

      // console.log(match, epochMs);
      // console.log("Converting to UTC String");
      d.setUTCMilliseconds(epochMs); // set the dat obj to the video creatiume time in epoch ms
      data.createdAt = d.toISOString(); // Convert to UTC timestamp
    })

    // Success Callback
    .next(function() {
      params.client.end();
      console.log('Done!');
      console.log(JSON.stringify(data, null, 2));
      return callback(null, data);
    })

    // Global Error Callback
    .catch((e) => console.log(e));
};

function uploadVid(event, credentials, params, callback) {
  // var localPath = 'X:\\S3Gateway\\NeroMedia\\xxxmultimedia-downloads\\' + event.filename;
  var uploadCount;
  console.log(params);
  client
    .init().catch(function(err, params) {
      params.client.end();
      console.log('WDIO.init() failed.');
      return callback(`WDIO.init() failed.`, {});
    }, params)

    // Login and wait for user to click submit
    .url('https://www.manyvids.com/Login/')
    .setValue('#triggerUsername', credentials.user)
    .setValue('#triggerPassword', credentials.pass)
    .waitForVisible('body > div.mv-profile', 60000)

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
}

module.exports = {
  login: auth,
  editVid: getVid,
  uploadVid: uploadVid,
  postVid: postVid
};
