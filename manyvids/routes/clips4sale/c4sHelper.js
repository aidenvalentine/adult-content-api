const dateutil = require('dateutil');
const dateFormat = require('dateformat');
var HashMap = require('hashmap');

require('dotenv').config({
  path: './config/79949.env'
});

// Create accociative array for the clip title suffix
var map = new HashMap();
map
  .set("HD_MP4", " - Full HD 1080p MP4")
  .set("SD_MP4"," - SD 480p MP4")
  .set("HD_WMV"," - Full HD 1080p WMV")
  .set("SD_WMV"," - SD 480p WMV")
  .set("MOBILE_HD"," - Mobile hd 720p MP4")
  .set("MOBILE_LOW"," - Mobile Low MP4");

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
 * Create New Clip
 * @param  {Integer}  event    The clip data
 * @param  {Object}   params   client, cookie
 * @param  {Function} callback [description]
 * @return {Object}            [description]
 */
function postClip(event, params, callback) {
  var description = event.description;
  var response = {};
  console.log(event, params); // Debug

  params.client
    // .init()
    .setCookie(params.cookie)
    .url('https://admin.clips4sale.com/clips/')
    .waitForVisible('[name="ClipTitle"]', 3000)
    .setValue('[name="ClipTitle"]', event.name +  map.get(event.flavor))
    .execute(function(description) {
      console.log(description);
        // browser context - you may not access client or console
        tinyMCE.activeEditor.setContent(description, {format: "raw"});
    }, description)
    .selectByValue('[name="ClipName"]', event.filename).catch(function(err) {
      response.err = err;
      response.msg = 'Error: Video file not found in uploads.';
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      return callback(err, response);
    })
    .pause(2000)
    // .selectByVisibleText('[name="ClipCat"]', event.category)
    .selectByVisibleText('[name="ClipCat"]', event.category) // added to be compatible with the Type Category
    .selectByVisibleText('#key1', event.relatedCategories[0])
    .selectByVisibleText('#key2', event.relatedCategories[1])
    .selectByVisibleText('#key3', event.relatedCategories[2])
    .selectByVisibleText('#key4', event.relatedCategories[3])
    .selectByVisibleText('#key5', event.relatedCategories[4])
    .setValue('[name="keytype[0]"]', event.tags[0])
    .setValue('[name="keytype[1]"]', event.tags[1])
    .setValue('[name="keytype[2]"]', event.tags[2])
    .setValue('[name="keytype[3]"]', event.tags[3])
    .setValue('[name="keytype[4]"]', event.tags[4])
    .setValue('[name="keytype[5]"]', event.tags[5])
    .setValue('[name="keytype[6]"]', event.tags[6])
    .setValue('[name="keytype[7]"]', event.tags[7])
    .setValue('[name="keytype[8]"]', event.tags[8])
    .setValue('[name="keytype[9]"]', event.tags[9])
    .setValue('[name="keytype[10]"]', event.tags[10])
    .setValue('[name="keytype[11]"]', event.tags[11])
    .setValue('[name="keytype[12]"]', event.tags[12])
    .setValue('[name="keytype[13]"]', event.tags[13])
    .setValue('[name="keytype[14]"]', event.tags[14])
    .setValue('[name="DisplayOrder"]', event.displayOrder || 0)
    .selectByValue('[name="ClipImage"]', event.thumbnailFilename).catch(function(err) {
      response.err = err;
      response.msg = 'Error: Thumbnail not found in uploads.';
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      return callback(err, response);
    })
    .selectByValue('[name="clip_preview"]', event.trailerFilename).catch(function(err) {
      response.err = err;
      response.msg = 'Error: Trailer not found in uploads.';
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      return callback(err, response);
    })
    .selectByValue('[name="ClipPrice"]', event.price)
    .selectByValue("[name='fut_month']", dateFormat(event.releaseDate, "mm"))
    .selectByValue("[name='fut_day']", dateFormat(event.releaseDate, "dd"))
    .selectByValue("[name='fut_year']", dateFormat(event.releaseDate, "yyyy"))
    .selectByValue("[name='fut_hour']", dateFormat(event.releaseDate, "HH"))
    .selectByVisibleText("[name='fut_minute']", dateFormat(event.releaseDate, "MM"))

    // .setValue('[name="ContainsNudity"]', event.containsNudity || 1)
    // .setValue('[name="members"]', event.members || 0)
    // .setValue('[name="ClipActive"]', event.clipActive || 1)
    // .setValue('[name="use_future"]', event.useFuture || 0)

    // Success Callback
    .next(function() {
      // params.client.end();
      console.log('Done!');
      console.log(JSON.stringify(event, null, 2));
      return callback(null, event);
    })

    // Global Error Callback
    .catch((e) => {
      params.client.end();
      console.log(e);
      return callback(null, event);
    });
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
  getClip: getClip,
  postClip: postClip
};
