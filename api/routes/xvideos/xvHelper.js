const dateutil = require('dateutil');
const dateFormat = require('dateformat');
var http = require('http');
var fs = require('fs');
var path = require('path');
var Minio = require('minio');
var HashMap = require('hashmap');

/**
 * Login to Xvideos.
 * Init a new webdriverio session.
 * @param  {webdriverio}   client   A webdriverio client
 * @param  {Function}      callback err, data
 * @return {Object}                 A webdriverio cookie containing the authenticated PHPSESSID
 */
function auth(credentials, params, callback) {
  console.log(credentials);
  params.client
    .init()
    .url('https://www.xvideos.com/account')
    .pause(1000)
    // .waitForVisible('form', 3000)
    .setValue('body #signin-form_login', credentials.user)
    .setValue('body #signin-form_password', credentials.pass)
    // .submitForm('body #signin-form')
    .click('#signin-form > div.form-group.form-buttons > div > button')
    .pause(1000)
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
function getUpload(id, params, callback) {
  var data = {};
  var dateObj = {};
  var formData = {};
  formData.translations = [];
  formData.translations.push({});
  formData.tags = [];

  params.client
    /* .setCookie(params.cookie) */
    .url(`https://www.xvideos.com/account/uploads/${id}/edit`)
    .pause(1000)

    /* Title & Description */
    // Xvideos Title
    .getValue('#edit_form_titledesc_title').then(function(val) {
      formData.translations[0].xvideosName = val;
    })
    // Xvideos Lang
    .getValue('#edit_form_titledesc_title_lang').then(function(val) {
      formData.translations[0].xvideosLang = val;
    })

    // Xvideos Title
    .getValue('#edit_form_titledesc_title_network').then(function(val) {
      formData.translations[0].networkName = val;
    })
    // Xvideos Lang
    .getValue('#edit_form_titledesc_title_network_lang').then(function(val) {
      formData.translations[0].networkLang = val;
    })

    // Translations
    .getAttribute('#edit_form_title_translations_title_network_translations_ntr_0_ntr_0_title_lang', 'value').then(function(val) {
      formData.translations.push({});
      formData.translations[1].xvideosLang = val;
    })
    .getAttribute('#edit_form_title_translations_title_network_translations_ntr_0_ntr_0_title_lang', 'value').then(function(val) {
      formData.lang = val;
    })
    /*     .getAttribute('#edit_form_title_translations_title_translations_tr_0_tr_0_title_lang', 'value').then(function(val) {
            // console.log('key1 is: ' + JSON.stringify(val));
            if(val !== null && val !== '' && val !== 'Select Related Categories') {
              formData.relatedCategories.push(val);
            }
        }) */
    /*     .execute(function(data) {
            data.translations = [];
    		var obj = {
    			lang: jQuery('#edit_form_title_translations_title_translations_tr_0_tr_0_title_lang')[0].value,
    			xvideos: jQuery('input[name="edit_form[title_translations][title_translations][tr_0][tr_0_title_lang]"]')[0].value,
    			network: jQuery('input[name="edit_form[title_translations][title_translations][tr_0][tr_0_title_lang]"]')[0].value
    		};
    		data.translations.push(obj);
            return data.translations;
        }, data).then(function(data) {
            formData.translations = data.translations;
            console.log(formData.translations);
        }) */

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
      // params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      return callback(e, {
        msg: "A global error ocurred. Please check the app."
      });
    });
};

/**
 * Create New Clip
 * @param  {Integer}  event    The clip data
 * @param  {Object}   params   client, cookie
 * @param  {Function} callback [description]
 * @return {Object}            [description]
 */
function postUpload(event, params, callback) {
  // Allow insecure TLS connections
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

  // Custom command
  /* 	params.client.addCommand("getUrlAndTitle", function (customVar) {
  		// `this` refers to the `browser` scope
  		return {
  			url: this.getUrl(),
  			title: this.getTitle(),
  			customVar: customVar
  		};
  	}); */

  // Ass. Array -
  var video_premium = new HashMap();
  video_premium
    .set("Free for All", "upload_form_video_premium_video_premium_centered_zone_all_site")
    .set("Paying Users", "upload_form_video_premium_video_premium_centered_zone_premium");

  var networksites = new HashMap();
  networksites
    .set("Xvideos Only", "upload_form_networksites_networksites_centered_networksites_DEFAULT_ONLY")
    .set("Xvideos & Network", "upload_form_networksites_networksites_centered_networksites_NO_RESTRICTION");

  var category = new HashMap();
  category
    .set("Straight", "upload_form_category_category_centered_category_straight")
    .set("Gay", "upload_form_category_category_centered_category_gay")
    .set("Shemale", "upload_form_category_category_centered_category_shemale");

  // Setup minio client
  // var minioClient = new Minio.Client({
  // 	endPoint: '',
  // 	port: 9000,
  // 	useSSL: true,
  // 	accessKey: '',
  // 	secretKey: ''
  // });
  //
  // var size = 0;
  //
  // minioClient.fGetObject('bucket', event.filename, './tmp/'+event.filename, function(e) {
  //   if (e) {
  // 	return console.log(e)
  //   }
  //   console.log('Done downloading. Starting HTTP server for local file on localhost.')
  //   var stats = fs.statSync('./tmp/'+event.filename);
  //   var fileSizeInBytes = stats.size;

  // Create HTTP server to serve URL upload option from. @todo kill on fail/success
  // http.createServer(function (req, res) {
  // 	console.log("Port Number : 3003");
  // 	// change the MIME type to 'video/mp4'
  // 	res.writeHead(200, {
  // 		'Content-Type': 'video/mp4',
  // 		'Content-Length': fileSizeInBytes
  // 	});
  // 	fs.exists('./tmp/'+event.filename,function(exists){
  // 		if(exists)
  // 		{
  // 			var rstream = fs.createReadStream('./tmp/'+event.filename);
  // 			rstream.pipe(res);
  // 		}
  // 		else
  // 		{
  // 			res.send("Its a 404");
  // 			res.end();
  // 		}
  // 	});
  // }).listen(3003);

  // Remove . and / from titles per C4S
  var name = event.name.replace('.', '').replace('/', '');
  console.log(`Clean Title: ${name}`);
  var description = `${event.description}`;

  console.log(event, params); // Debug

  if (event["video_premium"] == "upload_form_video_premium_video_premium_centered_zone_premium") {
    params.client.click('#' + event["networksites"]);
  }

  /* 		var langCount = event["translations"].length;
  		console.log(langCount);
  	  for (var i = 0; i < langCount.length; i++) {
  		  var iteration = i+1;
  		  params.client
  			.click('#upload_form_title_translations_title_translations > button').pause(1000)
  			.click('a[data-locale="' + event["translations"][iteration]["lang"] + '"]').pause(100)
  			.setValue('#upload_form_title_translations_title_translations_tr_' + i + '_tr_' + i + '_title', event["translations"][iteration]["xvideosTitle"]).pause(100)
  	  } */

  params.client
    // .init()
    /* .setCookie(params.cookie) */
    .url('https://www.xvideos.com/account/uploads/new')
    .pause(1000)
    .click('input#' + event["video_premium"])
    .click('input#' + event["category"])
    .click('input#' + event["networksites"])

    // Title & Description
    .setValue('textarea#upload_form_titledesc_description', event.description.substring(0, 500).replace(/<[^>]*>?/gm, ''))
    .setValue('input#upload_form_titledesc_title', event.name)
    .setValue('input#upload_form_titledesc_title_network', event.networkName).pause(100)

    // Select File HTTP(S)
    // .setValue('#upload_form_file_file_options_file_2_video_url', 'http://s3.xxxmultimedia.com:3003/'+event.filename).pause(100)
    // .click('#upload_form_file_file_options_file_2 > div > div > span > button').pause(100)
    // .click('#upload_form_file_file_options_file_2 > div > div > span').pause(1000)

    // Ads to display
    // .click('#upload_form_sponsorlinks_sponsorlinks_'+event.sponsoredLinks[0]).pause(100)
    .click('input#upload_form_sponsorlinks_sponsorlinks_19609').pause(100)

    // Agree to terms
    .click('#upload_form_file > div.form-group.form-field-upload_form_file_terms > div > div > label > div.checkbox-error-box').pause(1000)
    // Add tags
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[0] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[1] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[2] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[3] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[4] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[5] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[6] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[7] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[8] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[9] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[10] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[11] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[12] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[13] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[14] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[15] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[16] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[17] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[18] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)
    .setValue('div.tag-list > input[type="text"]', event.tags[19] || '').pause(100)
    .click('//*[@id="upload_form_tags"]/div/div/div[1]/div[1]/button').pause(100)

    .execute(function(event) {
      console.log(event);
      if (event["translations"][1]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][1]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_0_tr_0_title').val(event["translations"][1]["xvideosTitle"]);
        if (event["translations"][1]["lang"] && event["translations"][1]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations_ntr_0 > div > div > div > span > button').click();
          $('a[data-locale="' + event["translations"][1]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_0_ntr_0_title').val(event["translations"][1]["networkTitle"]);
        }
      }
      if (event["translations"][2]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][2]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_1_tr_1_title').val(event["translations"][2]["xvideosTitle"]);
        if (event["translations"][2]["lang"] && event["translations"][2]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][2]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_1_ntr_1_title').val(event["translations"][2]["networkTitle"]);
        }
      }
      if (event["translations"][3]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][3]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_2_tr_2_title').val(event["translations"][3]["xvideosTitle"]);
        if (event["translations"][3]["lang"] && event["translations"][3]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][3]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_2_ntr_2_title').val(event["translations"][3]["networkTitle"]);
        }
      }
      if (event["translations"][4]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][4]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_3_tr_3_title').val(event["translations"][4]["xvideosTitle"]);
        if (event["translations"][4]["lang"] && event["translations"][4]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][4]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_3_ntr_3_title').val(event["translations"][4]["networkTitle"]);
        }
      }
      if (event["translations"][5]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][5]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_4_tr_4_title').val(event["translations"][5]["xvideosTitle"]);
        if (event["translations"][5]["lang"] && event["translations"][5]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][5]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_4_ntr_4_title').val(event["translations"][5]["networkTitle"]);
        }
      }
      if (event["translations"][6]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][6]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_5_tr_5_title').val(event["translations"][6]["xvideosTitle"]);
        if (event["translations"][6]["lang"] && event["translations"][6]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][6]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_5_ntr_5_title').val(event["translations"][6]["networkTitle"]);
        }
      }
      if (event["translations"][7]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][7]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_6_tr_6_title').val(event["translations"][7]["xvideosTitle"]);
        if (event["translations"][7]["lang"] && event["translations"][7]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][7]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_6_ntr_6_title').val(event["translations"][7]["networkTitle"]);
        }
      }
      if (event["translations"][8]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][8]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_7_tr_7_title').val(event["translations"][8]["xvideosTitle"]);
        if (event["translations"][8]["lang"] && event["translations"][8]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][8]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_7_ntr_7_title').val(event["translations"][8]["networkTitle"]);
        }
      }
      if (event["translations"][9]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][9]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_8_tr_8_title').val(event["translations"][9]["xvideosTitle"]);
        if (event["translations"][9]["lang"] && event["translations"][9]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][9]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_8_ntr_8_title').val(event["translations"][9]["networkTitle"]);
        }
      }
      if (event["translations"][10]) {
        $('#upload_form_title_translations_title_translations > button').click();
        $('a[data-locale="' + event["translations"][10]["lang"] + '"]').click();
        $('#upload_form_title_translations_title_translations_tr_9_tr_9_title').val(event["translations"][10]["xvideosTitle"]);
        if (event["translations"][10]["lang"] && event["translations"][10]["networkTitle"]) {
          $('#upload_form_title_translations_title_network_translations > button').click();
          $('a[data-locale="' + event["translations"][10]["lang"] + '"]').click();
          $('#upload_form_title_translations_title_network_translations_ntr_8_ntr_8_title').val(event["translations"][10]["networkTitle"]);
        }
      }
      return;
    }, event)
    .pause(1000)

    // Submit form
    // .click('#upload_form_file_file_options > div > div > span:nth-child(3) > button').pause(1000)

    // .waitForVisible('#upload-form-progress', 900000).then(console.log('Now uploading your clip. Please wait.')) // Wait 10 minutes for the form to be complete and uploaded. Else fail
    .waitForVisible('#upload-form-progress > h5.status.text-success', 999999999).pause(10000)
    .execute(function(event) {
      console.log(event);
      $('h5 > span.text-success > a.text-success').href;
    }, event)
    .then(function() {
      params.client.end();
    })
    /** Success Callback */
    // .waitUntil(() => {
    //   var elem = $('iframe#iframe-upload').contents();
    //   return $("#iframeID").contents().find("[tokenid=" + token + "]").html();
    // }, 300000, 'expected text to be different after 5s');
    .next(function() {
      console.log('Done!');
      console.log(JSON.stringify(event, null, 2));
      // params.client.end(); // Stable version only
      return callback(null, event);
    })

    // Global Error Callback
    .catch((e) => {
      params.client.end(); // Stable version only
      console.log(e);
      return callback(null, event);
    });
  // })

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
  getUpload: getUpload,
  postUpload: postUpload
};
