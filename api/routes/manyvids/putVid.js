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
  debug: true
};
var client = webdriverio.remote(config);
const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"))
var event = JSON.parse(process.argv[2]);

client
  .init()
  .url('https://www.manyvids.com/Login/')
  .setValue('#triggerUsername', conf.settings.manyvids.user)
  .setValue('#triggerPassword', conf.settings.manyvids.pass)
  .waitForVisible('body > div.mv-profile', 30000)
  .pause(2000)
  .url(`https://www.manyvids.com/Edit-vid/${event.manyvids_id}/`)
  .waitForVisible('input#Title', 60000)
  .execute(function(event) {
    $(document).ready(function() {
      // Title
      $('[name="video_title"]').val(event.name);
      // Description
      $('[name="video_description"]').val(event.description.replace(/(<([^>]+)>)/ig, "")); // Strip HTML tags

      // Teaser
      // Thumbnail

      // Categories
      if ($('ul.multi-dropdown-list').length) {
        $('ul.multi-dropdown-list').html(''); // Clear list
      }
      event.categories.forEach(function(value, index){
        $('ul.multi-dropdown-list').append(`<li><a href="javascript:;" class="remove-tag" title="Remove tag">x</a>CAT # ${value}<input name="tags[]" type="hidden" value="${event.manyvids.categories[index]}"></li>`);
      });

      // "Set Your Price" - Default
      // TODO: Set price by video length
      $("#free_vid_0").click();
      $('[name="video_cost"]').val(event.price || 9.99);

      // "MV Tube"
      if (event.tube) {
        $("#free_vid_1").click();
        $("#appendedPrependedDownloadCost").val(event.price || 4.99); // Download price
      }

      // "Make This Vid Free"
      if (event.free) {
        $("#free_vid_2").click();
      }

      // Intensity
      $('#intensity').val(event.intensity || 0);
      $('#intensity').niceSelect('update');

      // Discount
      $("#sale").val(event.discountPercentage || "");
      $("#sale").niceSelect('update');

      // Exclusive?
      $("#exclusiveVid").prop("checked", event.exclusive || false);

      // Model Attributes
      $("#age_basic").val(event.age || false);
      $("#age_basic").niceSelect('update');
      $("#ethnicity_basic").val(event.ethnicity || false);
      $("#ethnicity_basic").niceSelect('update');
      $("#breast_size_basic").val(event.breastSize || false);
      $("#breast_size_basic").niceSelect('update');

      // Custom Vid Order?
      $("#show_customvid_table").prop("checked", event.custom || false);

      // Security Options
      $("#stream_only").val(event.streamOnly || 1);
      $("#stream_only").niceSelect("update");

      // Block Teaser
      $("#block_preview").prop("checked", event.blockPreview || false);

      // Content Rating
      if (event.sfw === true || event.nsfw === false) {
        $("#safe_for_work").val(1199); // SFW
      } else {
        $("#safe_for_work").val(); // NSFW (Default)
      }
      $("#safe_for_work").niceSelect('update');
    });
  }, event)

  .catch((e) => {
    client.end();
    console.log(e);
    // return callback(e);
  });
