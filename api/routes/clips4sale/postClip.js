const dateutil = require('dateutil');
const dateFormat = require('dateformat');
var fs = require('fs');
var path = require('path');
var webdriverio = require('webdriverio');
const spawn = require('child_process').spawn; // TODO Change to fork

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
// let settings = fs.readFileSync(path.join(process.env.APPDATA, "clipnuke", "config.json"));
console.log(conf);

console.log(process.argv);
var event = JSON.parse(process.argv[2]);

// ETL
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
console.log(event); // Debug

// Set defaults if not set -- so this script doesn't throw exceptions
if (!event.filename) {
  event.filename = '';
} else {
  event.filename = path.parse(event.filename).base; // Get filename
}
if (!event.thumbnailFilename) {
  event.thumbnailFilename = -2;
} else {
  event.thumbnailFilename = path.parse(event.thumbnailFilename).base; // Get filename
}
if (!event.trailerFilename) {
  event.trailerFilename = '';
} else {
  event.trailerFilename = path.parse(event.trailerFilename).base; // Get filename
}

client
  .init()
  .url('https://admin.clips4sale.com/login/index')
  .waitForVisible('input#username', 3000)
  .setValue('input#username', conf.settings.clips4sale.user)
  .setValue('input#password', conf.settings.clips4sale.pass).pause(200)
  // .submitForm('input.btn-primary')
  .click('input.btn.btn-primary')
  .setCookie({
    domain: "admin.clips4sale.com",
    name: "PHPSESSID",
    secure: false,
    value: conf.settings.clips4sale.phpsessid,
    // expiry: seconds+3600 // When the cookie expires, specified in seconds since Unix Epoch
  })
  .pause(1000)
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
    var cleanDesc = description.replace(/kid|xxxmultimedia.com|xxxmultimedia|hooker|teenager|force|forced|forcing|teenie/g, '');
    // browser context - you may not access client or console
    tinyMCE.activeEditor.setContent(`${cleanDesc}`, {
      format: "raw"
    });
  }, description)
  .selectByVisibleText('select#keycat', event.category).catch(function(err) {
    response.err = err;
    response.msg = 'Error: Category 1 Not Found.';
    // client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    console.log(response);
    client.end();
    // return callback(err, response);
  }).pause(200)
  .selectByVisibleText('select#key1', event.relatedCategories[0] || 'Select Related Categories').catch(function(err) {
    response.err = err;
    response.msg = 'Error: Category 2 Not Found.';
    // client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    console.log(response);
    client.end();
    // return callback(err, response);
  }).pause(200)
  .selectByVisibleText('select#key2', event.relatedCategories[1] || 'Select Related Categories').catch(function(err) {
    response.err = err;
    response.msg = 'Error: Category 3 Not Found.';
    // client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    console.log(response);
    client.end();
    // return callback(err, response);
  }).pause(200)
  .selectByVisibleText('select#key3', event.relatedCategories[2] || 'Select Related Categories').catch(function(err) {
    response.err = err;
    response.msg = 'Error: Category 4 Not Found.';
    // client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    console.log(response);
    client.end();
    // return callback(err, response);
  }).pause(200)
  .selectByVisibleText('select#key4', event.relatedCategories[3] || 'Select Related Categories').catch(function(err) {
    response.err = err;
    response.msg = 'Error: Category 5 Not Found.';
    // client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    console.log(response);
    client.end();
    // return callback(err, response);
  }).pause(200)
  .selectByVisibleText('select#key5', event.relatedCategories[4] || 'Select Related Categories').catch(function(err) {
    response.err = err;
    response.msg = 'Error: Category 6 Not Found.';
    // client.end(); /** Ends browser session {@link editVid| read editVids docs} */
    console.log(response);
    client.end();
    // return callback(err, response);
  }).pause(200)

  /* TRAILERS */
  .execute(function(event) {
    console.log("Selecting the trailer file.", event.trailerFilename.replace(/^.*[\\\/]/, ''));
    $('#clip_preview').val(event.trailerFilename);
    $('#clip_preview').trigger('change');
  }, event)

  /* VIDEO FILE */
  .execute(function(event) {
    $('#ClipImage').val(event.thumbnailFilename);
    $('#ClipImage').trigger('change');
  }, event)

  /* VIDEO FILE */
  .execute(function(event) {
    $('#ClipName').val(event.filename.replace(/^.*[\\\/]/, '') || "");
    $('#ClipName').trigger('change');
  }, event).pause(1000)

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

  // .waitUntil(() => {
  //   return window.location.href.indexOf('?c=') != -1
  // }, 900000)

  // Success Callback
  .then(function(data) {
    console.log(data);
    // client.end();
    console.log('Done!');
    console.log(JSON.stringify(event, null, 2));

    // return callback(null, event);
  })

  // Global Error Callback
  .catch((e) => {
    client.end();
    // client.session('delete');
    console.log(e);
    // return callback(e);
  });
