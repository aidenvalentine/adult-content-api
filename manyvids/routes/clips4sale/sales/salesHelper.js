var request = require('request');
var request = request.defaults({jar: true});

// clips4sale Helper
const c4s = require('../c4sHelper.js');

// Webdriver Client Instance
const client = require('../../../webdriverio/client.js').client;

// Test cookie - Pre-authenticated
const cookie =  require('../cookie.json');

function getReport(params, callback) {
  var reponse = {};
  var credentials = {
    user: process.env.C4S_USER,
    pass: process.env.C4S_PASS
  };
  const wdioParams = {
    client: client,
    cookie: cookie
  };
  this.s_year = params.s_year;
  this.s_month = params.s_month;
  this.s_day = params.s_day;
  this.e_year = params.e_year;
  this.e_month = params.e_month;
  this.e_day = params.e_day;
  this.report_type = params.report_type || "Detail1"; // Detail1, sum, categoryGroupingReport, ClipsNeverSoldReport, tributes, refundsChargebacks
  this.stores = params.stores || "all"; // all, clip, video, image
  this.action = params.action || "reports";
  const reqData = this;
  c4s.login(credentials, wdioParams, function(err, data) {
    client
      .setCookie(cookie)
      .url(`https://admin.clips4sale.com/sales-reports/index`)
      .waitForVisible('[name="did_submit"]', 3000)
      .executeAsync(function(data, reqData, done) {
        console.log(reqData);
          $.ajax({
            type: "POST",
            async: false,
            url: "https://admin.clips4sale.com/sales/json",
            data: reqData,
            success: function(res) {
              console.log(res); // Debug in browser
              done(res);
            },
            dataType: "json"
          });
      }, data, reqData).then(function(output) {
          console.log(output);
          reponse.data = output.value;
          callback(null, output.value);
      })
      // Success Callback
      .next(function() {
        client.end(); /** Ends browser session {@link editVid| read editVids docs} */
        console.log('Done!');
        console.log(JSON.stringify(reponse, null, 2));
        return callback(null, reponse);
      })

      // Global Error Callback
      .catch((e) => {
        console.log(e);
        client.end(); /** Ends browser session {@link editVid| read editVids docs} */
        return callback(e, {});
      });
  });
}

module.exports = {
  getReport: getReport
};
