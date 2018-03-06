/**
 * Login to ManyVids
 * @param  {webdriverio}   client   A webdriverio client
 * @param  {Function}      callback err, data
 * @return {Object}                 A webdriverio cookie containing the authenticated PHPSESSID
 */
function auth(params, callback) {
  params.client
    .init()
    .url('https://www.manyvids.com/Login/')
    .waitForVisible('button.js-warning18-popup', 3000)
    .click('button.js-warning18-popup')
    .setValue('#triggerUsername', process.env.USER)
    .setValue('#triggerPassword', process.env.PASS)
    .click('#loginAccountSubmit')
    // .pause(15000) // Wait in case we need to solve a recaptcha.
    .getCookie('PHPSESSID').then(function(cookie) {
      console.log('Cookie is: ' + JSON.stringify(cookie));
      return cookie;
    })
    .next(function (data) {
      console.log(data);
      return callback(null, data);
    }).catch((e) => console.log(e));
};

/**
 * Edit Vid - Details
 * @param  {Integer}   id      A ManyVids Video ID
 * @param  {Object}   params   client, cookie
 * @param  {Function} callback [description]
 * @return {Object}            An object containing details about a ManyVids video.
 */
function editVid(id, params, callback) {
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
      console.log('Price is: ' + JSON.stringify(val*1));
      data.price = val*1;
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

    // Video Length
    .getAttribute('.js-video-length', 'data-video-length').then(function(val) {
      data.lengthSeconds = val * 1;
      // data.lengthMinutes = val*1;
      console.log(data.lengthSeconds);
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
          data.salePrice = data.price - ( ( discount / 100 ) * data.price );
        }
    })

    /** CreatedAt Timestamp
     * Epoch milliseconds to UTC string
     */
    .getAttribute('//*[@id="rmpPlayer"]', 'data-video-filepath').then(function(val) {
      // var val = "https://dntgjk0do84uu.cloudfront.net/364438/e1a1813a9e1abe9866c0b74118081a58/preview/1520188436784.mp4_480_1520188447.m3u8"; // test string
      var regex = /https:\/\/.*\/.*\/(\d{13}).mp4_\d{3,4}_\d{10}.m3u8/; // Regex search string
      var match = regex.exec(val);
      var epochMs = match[1]; // Match regex group 1
      // console.log(match, epochMs);
      // console.log("Converting to UTC String");
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      d.setUTCMilliseconds(epochMs); // set the dat obj to the video creatiume time in epoch ms
      data.createdAt = d.toISOString(); // Convert to UTC timestamp
    })

    // Success Callback
    .next(function() {
      console.log('Done!');
      console.log(JSON.stringify(data, null, 2));
      // return callback(null, data);
    })

    // Global Error Callback
    .catch((e) => console.log(e));
};

module.exports = {
  login: auth,
  editVid: editVid
};
