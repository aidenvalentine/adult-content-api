const dateutil = require('dateutil');

require('dotenv').config({
  path: './config/79949.env'
});

/**
 * Login to Clips4Sale.
 * Init a new webdriverio session.
 * @param  {webdriverio}   client   A webdriverio client
 * @param  {Function}      callback err, data
 * @return {Object}                 A webdriverio cookie containing the authenticated PHPSESSID
 */
function auth(credentials, params, callback) {
  params.client
    .init()
    .url('https://admin.clips4sale.com/login/index')
    .waitForVisible('form', 3000)
    .setValue('#username', credentials.user)
    .setValue('#password', credentials.pass)
    .click('form input.btn-primary')
    // .pause(15000) // Wait in case we need to solve a recaptcha.
    .getCookie(['PHPSESSID']).then(function(cookie) {
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
 * Sends a GET request to the server, using an authenticated webdriverio session, fetches the data, then ends the session.
 * NOTE: It's super important to use .end() method to end the browser session. Because {@link auth | auth} calls init() to open a new browser session.
 * IMPORTANT: If we don't run browser.end(), this app will fail when {@link getVid | getVid} or another method is called!
 * @param  {Integer}   id      A ManyVids Video ID
 * @param  {Object}   params   client, cookie
 * @param  {Function} callback [description]
 * @return {Object}            An object containing details about a ManyVids video.
 */
function getClip(id, params, callback) {
  var data = {};
  var dateObj = {};
  var formData = {};
  formData.relatedCategories = [];
  formData.tags = [];
  formData.website = "CLIPS4SALE";
  formData.remoteId = id*1;

  params.client
    .setCookie(params.cookie)
    .url(`https://admin.clips4sale.com/clips/show/${id}`)
    .waitForVisible('[name="ClipTitle"]', 3000)
    .execute(function(data) {
        // Convert the raw HTML from tinyMCE into a JSON friendly version with himalaya
        data.description = tinyMCE.activeEditor.getContent({format: "raw"});
        // data.description = tinyMCE.activeEditor.getContent({format: "raw"});
        return data.description;
    }, data).then(function(data) {
        // Convert the raw HTML from tinyMCE into a JSON friendly version with himalaya
        // Then we need to stringify for Graph.cool to escape the quotes
        /** @todo UPDATE: Okay so apparently JSON.stringify() causes problems when updating a record in Graphcool. So... */
        // formData.description = himalaya.parse(data.value);
        formData.description = data.value;
        // formData.description = JSON.stringify(himalaya.parse(data.value));
    })
    .getValue('[name="ClipTitle"]').then(function(val) {
        console.log('Title is: ' + JSON.stringify(val));
        formData.name = val;
    })
    .getValue('[name="producer_id"]').then(function(val) {
        // console.log('Studio ID is: ' + JSON.stringify(val));
        formData.remoteStudioId = val*1;
    })
    .execute(function(data) {
        data.price = document.frm_upload.clip_price.value;
        return data.price;
    }, data).then(function(data) {
        formData.price = data.value*1;
        // console.log(formData.price);
    })
    .getAttribute('#select2-keycat-container', 'title').then(function(val) {
        // console.log('category is: ' + JSON.stringify(val));
        formData.category = val;
    })
    .getAttribute('#select2-key1-container', 'title').then(function(val) {
        // console.log('key1 is: ' + JSON.stringify(val));
        if(val !== null && val !== '' && val !== 'Select Related Categories') {
          formData.relatedCategories.push(val);
        }
    })
    .getAttribute('#select2-key2-container', 'title').then(function(val) {
        // console.log('key2 is: ' + JSON.stringify(val));
        if(val !== null && val !== '' && val !== 'Select Related Categories') {
          formData.relatedCategories.push(val);
        }
    })
    .getAttribute('#select2-key3-container', 'title').then(function(val) {
        // console.log('key3 is: ' + JSON.stringify(val));
        if(val !== null && val !== '' && val !== 'Select Related Categories') {
          formData.relatedCategories.push(val);
        }
    })
    .getAttribute('#select2-key4-container', 'title').then(function(val) {
        // console.log('key4 is: ' + JSON.stringify(val));
        if(val !== null && val !== '' && val !== 'Select Related Categories') {
          formData.relatedCategories.push(val);
        }
    })
    .getAttribute('#select2-key5-container', 'title').then(function(val) {
        // console.log('key5 is: ' + JSON.stringify(val));
        if(val !== null && val !== '' && val !== 'Select Related Categories') {
          formData.relatedCategories.push(val);
        }
    })
    .getValue('[name="keytype[0]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[1]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[2]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[3]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[4]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[5]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[6]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[7]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[8]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[9]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[10]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[11]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[12]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[13]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="keytype[14]"]').then(function(val) {
        // console.log('Keyword is: ' + JSON.stringify(val));
        if(val !== null && val !== '') {
           formData.tags.push(val);
        }
    })
    .getValue('[name="DisplayOrder"]').then(function(val) {
        // console.log('DisplayOrder is: ' + JSON.stringify(val*1));
        formData.displayOrder = val*1;
    })
    .getValue('[name="ClipName"]').then(function(val) {
        formData.filename = val;
    })
    .execute(function(data) {
        data.thumbnailFilename = $('#imageListDiv > select > option:selected')[0].value;
        return data.thumbnailFilename;
    }, data).then(function(data) {
        formData.thumbnailFilename = data.value;
        // console.log(formData.thumbnailFilename);
    })
    .getValue('#ClipTime').then(function(val) {
        formData.lengthMinutes = val*1;
        // console.log(formData.lengthMinutes);
    })
    .getValue('#producerUploadedPreview').then(function(val) {
        formData.trailerFilename = val;
    })
    .getValue("[name='fut_month']").then(function(val) {
        dateObj.mm = val;
    })
    .getValue("[name='fut_day']").then(function(val) {
        dateObj.dd = val;
    })
    .getValue("[name='fut_year']").then(function(val) {
        dateObj.yyyy = val;
    })
    .getValue("[name='fut_hour']").then(function(val) {
        dateObj.HH = val;
    })
    .getValue("[name='fut_minute']").then(function(val) {
        dateObj.MM = val;
        // console.log(dateObj);
        // console.log(dateutil.parse(dateObj.yyyy+"-"+dateObj.mm+"-"+dateObj.dd+" "+dateObj.HH+":"+dateObj.MM).toISOString());
        formData.releaseDate = dateutil.parse(dateObj.yyyy+"-"+dateObj.mm+"-"+dateObj.dd+" "+dateObj.HH+":"+dateObj.MM).toISOString();
    })

    // Success Callback
    .next(function() {
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log('Done!');
      console.log(JSON.stringify(formData, null, 2));
      return callback(null, formData);
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
function putVid(id, data, params, callback) {
  // var data = {};
  // data.video = {};
  // data.website = "MANYVIDS";
  // data.categories = [];
  console.log(id, data, params);

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
      console.log(val);
      if(val * 1) {
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
          data.salePrice = data.price - ( ( discount / 100 ) * data.price );
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

function uploadVids(file, params, callback) {
  console.log(file, params);

  params.client
    .setCookie(params.cookie)
    .url(`https://www.manyvids.com/Upload-vids/`)
    .pause(2000)
    .chooseFile("#container > div > input", file)
    .getValue("#container > div > input").then(function(val) {
      console.log('File to Upload: ' + JSON.stringify(val));
    });
}

module.exports = {
  login: auth,
  getClip: getClip
};
