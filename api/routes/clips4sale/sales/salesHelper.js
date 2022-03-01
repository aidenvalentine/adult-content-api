var request = require('request');
var request = request.defaults({
  jar: true
});

// clips4sale Helper
// const c4s = require('../c4sHelper.js');

// Webdriver Client Instance
// const client = require('../../../webdriverio/client.js').client;

function getReport(credentials, params, query, callback) {
  var reponse = {};
  /*   var credentials = {
      user: process.env.C4S_USER,
      pass: process.env.C4S_PASS
    }; */
  /*   const wdioParams = {
      client: client,
      cookie: cookie
    }; */
  // c4s.login(credentials, wdioParams, function(err, data) {
  params.client
    // .setCookie(cookie)
    .url('https://admin.clips4sale.com/sales-reports/index')
    .waitForVisible('table#sales-report-table', 9000)
    .executeAsync(function(query, cb) {
      var reqData = {
        s_year : query.s_year,
        s_month : query.s_month,
        s_day : query.s_day,
        e_year : query.e_year,
        e_month : query.e_month,
        e_day : query.e_day,
        report_type : query.report_type || "Detail1", // Detail1, sum, categoryGroupingReport, ClipsNeverSoldReport, tributes, refundsChargebacks
        stores : query.stores || "all", // all, clip, video, image
        action : query.action || "reports"
      };
      $.ajax({
        type: "POST",
        async: false,
        url: "https://admin.clips4sale.com/sales/json",
        data: reqData,
        success: function(res) {
          console.log(res); // Debug in browser
          cb(res);
        },
        dataType: "json"
      });
    }, query).then(function(output) {
      // console.log(output); // Debug
      reponse.data = output.value;
      console.log(reponse.data);
    })
    // Success Callback
    .next(function() {
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      console.log('Done!');
      console.log(JSON.stringify(reponse, null, 2));
      return callback(null, reponse);
    })

    // Global Error Callback
    .catch((e) => {
      console.log(e);
      params.client.end(); /** Ends browser session {@link editVid| read editVids docs} */
      return callback(e, e);
    });
  // });
}

module.exports = {
  getReport: getReport
};
