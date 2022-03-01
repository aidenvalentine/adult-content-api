const dateutil = require('dateutil');
const dateFormat = require('dateformat');
var HashMap = require('hashmap');
var fs = require('fs');
var path = require('path');

// Create accociative array for the clip title suffix
var map = new HashMap();
map
  .set("HD_MP4", " - Full HD 1080p MP4")
  .set("SD_MP4", " - SD 480p MP4")
  .set("HD_WMV", " - Full HD 1080p WMV")
  .set("SD_WMV", " - SD 480p WMV")
  .set("MOBILE_HD", " - Mobile hd 720p MP4")
  .set("MOBILE_LOW", " - Mobile Low MP4");

/**
 * Login to Clips4Sale.
 * Init a new webdriverio session.
 * @param  {webdriverio}   client   A webdriverio client
 * @param  {Function}      callback err, data
 * @return {Object}                 A webdriverio cookie containing the authenticated PHPSESSID
 */
function auth(credentials, params, callback) {
  console.log(credentials);
  console.log("Session ID: ", params.client.sessionId)
  // TODO Get fresh session if sessionId is defined
  if (params.client.sessionId) {
    params.client.end();
  }
  // console.log(params.client);
  params.client
    .init().catch(function(err) {
      params.client.end();
      console.log('WDIO.init() failed.', params);
      return callback(`WDIO.init() failed.`, {});
    }, params)
    .url('https://admin.clips4sale.com/login/index')
    .waitForVisible('input#username', 3000)
    .setValue('input#username', credentials.user)
    .setValue('input#password', credentials.pass).pause(200)
    // .submitForm('input.btn-primary')
    .click('input.btn.btn-primary')
    .setCookie({
      domain: "admin.clips4sale.com",
      name: "PHPSESSID",
      secure: false,
      value: credentials.phpsessid,
      // expiry: seconds+3600 // When the cookie expires, specified in seconds since Unix Epoch
    })
    // .pause(15000) // Wait in case we need to solve a recaptcha.
    /*     .getCookie([{"domain":"admin.clips4sale.com","httpOnly":false,"name":"PHPSESSID","path":"/","secure":false,"value":"jt0p2kiigvqdps9paqn6nqpnm8"}]).then(function(cookie) {
    	  var json = JSON.stringify(cookie);
          console.log('Cookie is: ' + json);
    	  fs.writeFile('cookie.json', json, 'utf8', callback);
          return cookie;
        }) */
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
function getClip(id, params, callback) {
  var data = {};
  var dateObj = {};
  var formData = {};
  formData.relatedCategories = [];
  formData.tags = [];
  formData.website = "CLIPS4SALE";
  formData.remoteId = id * 1;

  params.client
    // .setCookie(params.cookie)
    .url(`https://admin.clips4sale.com/clips/show/${id}`)
    .waitForVisible('input[name="ClipTitle"]', 90000)
    .execute(function(data) {
      // Convert the raw HTML from tinyMCE into a JSON friendly version with himalaya
      data.description = tinyMCE.activeEditor.getContent({
        format: "raw"
      });
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
    .getValue('input[name="ClipTitle"]').then(function(val) {
      console.log('Title is: ' + JSON.stringify(val));
      formData.name = val;
    })
    .getValue('input[name="producer_id"]').then(function(val) {
      // console.log('Studio ID is: ' + JSON.stringify(val));
      formData.remoteStudioId = val * 1;
    })
    .execute(function(data) {
      data.price = document.frm_upload.clip_price.value;
      return data.price;
    }, data).then(function(data) {
      formData.price = data.value * 1;
      // console.log(formData.price);
    })
    .getAttribute('#select2-keycat-container', 'title').then(function(val) {
      // console.log('category is: ' + JSON.stringify(val));
      formData.category = val;
    })
    .getAttribute('#select2-key1-container', 'title').then(function(val) {
      // console.log('key1 is: ' + JSON.stringify(val));
      if (val !== null && val !== '' && val !== 'Select Related Categories') {
        formData.relatedCategories.push(val);
      }
    })
    .getAttribute('#select2-key2-container', 'title').then(function(val) {
      // console.log('key2 is: ' + JSON.stringify(val));
      if (val !== null && val !== '' && val !== 'Select Related Categories') {
        formData.relatedCategories.push(val);
      }
    })
    .getAttribute('#select2-key3-container', 'title').then(function(val) {
      // console.log('key3 is: ' + JSON.stringify(val));
      if (val !== null && val !== '' && val !== 'Select Related Categories') {
        formData.relatedCategories.push(val);
      }
    })
    .getAttribute('#select2-key4-container', 'title').then(function(val) {
      // console.log('key4 is: ' + JSON.stringify(val));
      if (val !== null && val !== '' && val !== 'Select Related Categories') {
        formData.relatedCategories.push(val);
      }
    })
    .getAttribute('#select2-key5-container', 'title').then(function(val) {
      // console.log('key5 is: ' + JSON.stringify(val));
      if (val !== null && val !== '' && val !== 'Select Related Categories') {
        formData.relatedCategories.push(val);
      }
    })
    .getValue('input[name="keytype[0]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[1]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[2]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[3]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[4]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[5]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[6]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[7]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[8]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[9]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[10]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[11]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[12]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[13]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="keytype[14]"]').then(function(val) {
      // console.log('Keyword is: ' + JSON.stringify(val));
      if (val !== null && val !== '') {
        formData.tags.push(val);
      }
    })
    .getValue('input[name="DisplayOrder"]').then(function(val) {
      // console.log('DisplayOrder is: ' + JSON.stringify(val*1));
      formData.displayOrder = val * 1;
    })
    .getValue('input[name="ClipName"]').then(function(val) {
      formData.filename = val;
    })
    .execute(function(data) {
      data.thumbnailFilename = $('#imageListDiv > select > option:selected')[0].value;
      return data.thumbnailFilename;
    }, data).then(function(data) {
      formData.thumbnailFilename = data.value;
      // console.log(formData.thumbnailFilename);
    })
    .getValue('input#ClipTime').then(function(val) {
      formData.lengthMinutes = val * 1;
      // console.log(formData.lengthMinutes);
    })
    .getValue('#producerUploadedPreview').then(function(val) {
      formData.trailerFilename = val;
    })
    .getValue("#fut_month").then(function(val) {
      dateObj.mm = val;
    })
    .getValue("#fut_day").then(function(val) {
      dateObj.dd = val;
    })
    .getValue("#fut_year").then(function(val) {
      dateObj.yyyy = val;
    })
    .getValue("#fut_hour").then(function(val) {
      dateObj.HH = val;
    })
    .getValue("#fut_minute").then(function(val) {
      dateObj.MM = val;
      // console.log(dateObj);
      // console.log(dateutil.parse(dateObj.yyyy+"-"+dateObj.mm+"-"+dateObj.dd+" "+dateObj.HH+":"+dateObj.MM).toISOString());
      formData.releaseDate = dateutil.parse(dateObj.yyyy + "-" + dateObj.mm + "-" + dateObj.dd + " " + dateObj.HH + ":" + dateObj.MM).toISOString();
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
      // params.client.session('delete'); /** Ends browser session {@link editVid| read editVids docs} */
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
  var tagCount = event.tags.length;

  // Remove . and / from titles per C4S
  var name = event.name.replace('.', '').replace('/', '');
  console.log(`Clean Title: ${name}`);
  var description = `${event.description}`;
  var d = {
    mm: dateFormat(event.releaseDate, "mm"),
    d: dateFormat(event.releaseDate, "d"),
    yyyy: dateFormat(event.releaseDate, "yyyy"),
    HH: dateFormat(event.releaseDate, "HH"),
    MM: dateFormat(event.releaseDate, "MM"),
  };
  var response = {};
  console.log(event, params); // Debug

  if (!event.thumbnailFilename) {
    event.thumbnailFilename = -2;
  }
  if (!event.trailerFilename) {
    event.trailerFilename = '';
  }

  params.client
    // .init()
    // .setCookie(params.cookie)
    .url('https://admin.clips4sale.com/clips/index')
    .execute(function() {
      // window.addEventListener("beforeunload", function (e) {
      //   var confirmationMessage = "\o/";
      //
      //   (e || window.event).returnValue = confirmationMessage; //Gecko + IE
      //   return confirmationMessage;                            //Webkit, Safari, Chrome
      // });
    })
    .waitForVisible('input[name="ClipTitle"]', 30000)
    // .setValue('[name="ClipTitle"]', event.name +  map.get(event.flavor))
    .setValue('input[name="ClipTitle"]', name).pause(200)
    .getAttribute('input[name="producer_id"]', 'value').then(function(val) {
      // console.log('category is: ' + JSON.stringify(val));
      event.producer_id = val * 1;
      console.log(event.producer_id);
    })

    /* TRAILERS */
    // .execute(function(event) {
    //   console.log("Selecting the trailer file.", event.trailerFilename.replace(/^.*[\\\/]/, ''));
    //   $('#clip_preview').val(event.trailerFilename);
    // }, event)

    /* VIDEO FILE */
    // .execute(function(event) {
    //   $('#ClipImage').val(event.thumbnailFilename);
    // }, event)

    /* VIDEO FILE */
    // .execute(function(event) {
    //   $('#ClipName').val(event.filename.replace(/^.*[\\\/]/, ''));
    // }, event).pause(1000)

    /** PRODUCER ID */
    .execute(function(data) {
      var data = {};
      data.producer_id = $('input[name="producer_id"]')[0].value * 1;
      console.log(data);
      return data;
    }).then(function(data) {
      event.producer_id = data.producer_id;
      console.log(data.producer_id);
      // event.clip_id = data.clip_id;
    })
    .execute(function(description) {
      console.log(description);
      var cleanDesc = description.replace(/kid|hooker|teenager|force|forced|forcing|teenie/g, '');
      // browser context - you may not access client or console
      tinyMCE.activeEditor.setContent(`${cleanDesc}`, {
        format: "raw"
      });
    }, description)
    // .selectByValue('select#ClipName', path.basename(event.filename) || 'Select File-->').catch(function(err) {
    //   response.err = err;
    //   response.msg = 'Error: Video file not found in uploads.';
    //   // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    //   console.log(response);
    //   // return callback(err, response); // Don't send error to clipnuke.com
    // }).pause(1000)
    // .selectByVisibleText('[name="ClipCat"]', event.category)
    // .selectByValue("[name='fut_month']", dateFormat(event.releaseDate, "mm") || dateFormat(getDate(), "mm")).pause(200)
    .selectByVisibleText('select#keycat', event.category).catch(function(err) {
      response.err = err;
      response.msg = 'Error: Category 1 Not Found.';
      // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      params.client.end();
      return callback(err, response);
    }).pause(200)
    .selectByVisibleText('select#key1', event.relatedCategories[0] || 'Select Related Categories').catch(function(err) {
      response.err = err;
      response.msg = 'Error: Category 2 Not Found.';
      // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      params.client.end();
      return callback(err, response);
    }).pause(200)
    .selectByVisibleText('select#key2', event.relatedCategories[1] || 'Select Related Categories').catch(function(err) {
      response.err = err;
      response.msg = 'Error: Category 3 Not Found.';
      // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      params.client.end();
      return callback(err, response);
    }).pause(200)
    .selectByVisibleText('select#key3', event.relatedCategories[2] || 'Select Related Categories').catch(function(err) {
      response.err = err;
      response.msg = 'Error: Category 4 Not Found.';
      // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      params.client.end();
      return callback(err, response);
    }).pause(200)
    .selectByVisibleText('select#key4', event.relatedCategories[3] || 'Select Related Categories').catch(function(err) {
      response.err = err;
      response.msg = 'Error: Category 5 Not Found.';
      // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      params.client.end();
      return callback(err, response);
    }).pause(200)
    .selectByVisibleText('select#key5', event.relatedCategories[4] || 'Select Related Categories').catch(function(err) {
      response.err = err;
      response.msg = 'Error: Category 6 Not Found.';
      // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log(response);
      params.client.end();
      return callback(err, response);
    }).pause(200)

    /** TAGS */
    // Remove teenie
    .setValue('input[name="keytype[0]"]', event.tags[0] || '').pause(200)
    .setValue('input[name="keytype[1]"]', event.tags[1] || '').pause(200)
    .setValue('input[name="keytype[2]"]', event.tags[2] || '')
    .setValue('input[name="keytype[3]"]', event.tags[3] || '')
    .setValue('input[name="keytype[4]"]', event.tags[4] || '')
    .setValue('input[name="keytype[5]"]', event.tags[5] || '')
    .setValue('input[name="keytype[6]"]', event.tags[6] || '')
    .setValue('input[name="keytype[7]"]', event.tags[7] || '')
    .setValue('input[name="keytype[8]"]', event.tags[8] || '')
    .setValue('input[name="keytype[9]"]', event.tags[9] || '')
    .setValue('input[name="keytype[10]"]', event.tags[10] || '')
    .setValue('input[name="keytype[11]"]', event.tags[11] || '')
    .setValue('input[name="keytype[12]"]', event.tags[12] || '')
    .setValue('input[name="keytype[13]"]', event.tags[13] || '')
    .setValue('input[name="keytype[14]"]', event.tags[14] || '')
    .setValue('input[name="DisplayOrder"]', event.displayOrder || 0)
    .selectByValue("#fut_month", d.mm || dateFormat(getDate(), "mm")).pause(100)
    .selectByValue("#fut_day", d.d || dateFormat(getDate(), "dd")).pause(100)
    .selectByValue("#fut_year", d.yyyy || dateFormat(getDate(), "yyyy")).pause(100)
    .selectByValue("#fut_hour", d.HH || dateFormat(getDate(), "HH")).pause(100)
    .selectByValue("#fut_minute", d.MM || dateFormat(getDate(), "MM")).pause(100)
    // .waitForVisible('#fullwide > div.container-fluid > div.alert.alert-success', 900000).pause(10000)

    /* THUMBNAIL */
    // .selectByValue('#ClipImage', path.basename(event.thumbnailFilename) || 'Generate an animated gif banner').catch(function(err) {
    //   response.err = err;
    //   response.msg = 'Error: Thumbnail not found in uploads.';
    //   // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    //   console.log(response);
    //   // return callback(err, response); // Don't send error to clipnuke.com
    // }).pause(2000)

    /* TRAILER */
    // .selectByValue('select#clip_preview', path.basename(event.trailerFilename) || '').catch(function(err) {
    //   response.err = err;
    //   response.msg = 'Error: Trailer not found in uploads.';
    //   // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    //   console.log(response);
    //   // return callback(err, response); // Don't send error to clipnuke.com
    // }).pause(2000)

    // .selectByValue('#clip_price', event.price).catch(function(err) {
    //   response.err = err;
    //   response.msg = 'Error: Cannot Select a price.';
    //   // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    //   console.log(response);
    //   // return callback(err, response); // Don't send error to clipnuke.com
    // }).pause(2000)
    // .setValue('[name="ContainsNudity"]', event.containsNudity || 1)
    // .setValue('[name="members"]', event.members || 1 )
    // .setValue('[name="ClipActive"]', event.clipActive || 1)
    // .setValue('[name="use_future"]', event.useFuture || 0)
    // .click('#submitButton')
    // .pause(2000)
    // .waitForVisible('#fullwide > div.container-fluid > div.alert.alert-success', 900000).pause(10000)
    .waitUntil(() => {
      return window.location.href.indexOf('?c=') != -1
    }, 900000)
    // .getValue('input[name="id"]').then(function(val) {
    //       // console.log('Studio ID is: ' + JSON.stringify(val));
    // 	console.log(val);
    //       event.clip_id = val*1;
    //   })
    //   .execute(function(event) {
    // 	var urlParams = new URLSearchParams(window.location.search);
    // 	var data = {};
    // 	data.clip_id = urlParams.get('c')*1;
    //
    // 	console.log(urlParams.has('c')); // true
    // 	console.log(urlParams.get('c')); // "edit"
    // 	return data.clip_id;
    //   }).then(function(data) {
    //       event.clip_id = data.value;
    //       console.log(event.clip_id);
    //   })
    //   .click("#c4sTweet").pause(1000)
    //   .then(function(){
    //     params.client.end();
    //   })
    /* 	.waitUntil(function () {
    		console.log(window.clip_id);
    		return window.clip_id == undefined;
    	  // return $( 'input[name="id"]' )[0].value != "";
    	}, 5000, 'Error: waitUntil Clip ID (id) field is visible failed.') */
    /* 	.waitUntil(function() {
    		return params.client.execute(function() {
    			function() {
    				var val =
    				return val;
    			}
    			return window.clip_id != undefined;
    		}).then(function(result) {
    			console.log(result);
    			event.clip_id = result;
    			return result;
    		});
    	}, params) */
    // .selectByValue('[name="ClipPrice"]', event.price)
    /* 	.waitForVisible('.alert.alert-success', 20000)
    	.execute(function(data) {
    		// event.clip_id = clip_id*1;
    		event.producer_id = $('input[name="producer_id"]')[0].value*1;
    		event.clip_id = $('input[name="clip_id"]')[0].value*1;
    		console.log(JSON.stringify(event, null, 2));
    		return event;
    	}) */
    // .then(function(data) {
    // event.clip_id = data.value*1;
    // console.log(event.clip_id);
    // })

    // Success Callback
    .then(function(data) {
      console.log(data);
      params.client
        /* 		.waitForVisible('[name="ClipTitle"]', 3000)
        		.execute(function(data) {
        			data.clip_id = clip_id*1;
        			return data.clip_id;
        		}, data).then(function(data) {
        			event.clip_id = data.value*1;
        			console.log(event.clip_id);
        		})
        		.getValue('[name="id').then(function(val) {
        			console.log('Clip ID: ' + JSON.stringify(val));
        			if(val !== null && val !== '') {
        			   event.clip_id = val;
        			}
        		}) */
        .end();
      console.log('Done!');
      console.log(JSON.stringify(event, null, 2));

      return callback(null, event);
    })

    // Global Error Callback
    .catch((e) => {
      // params.client.end();
      // params.client.session('delete');
      console.log(e);
      return callback(e);
    });
};

module.exports = {
  login: auth,
  getClip: getClip,
  postClip: postClip
};
