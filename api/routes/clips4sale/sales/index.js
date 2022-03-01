var sales = require('express').Router({
  mergeParams: true
});
const path = require('path');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// clips4sale Helper
const c4s = require('../c4sHelper.js');
const salesHelper = require('./salesHelper.js');

const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));

// Test Route
/**
 * [exports description]
 * @type {[type]}
 * @query {Integer} s_year Start Year
 * @query {Integer} s_month Start Month
 * @query {Integer} s_day Start Day
 * @query {Integer} e_year End Year
 * @query {Integer} e_month End Month
 * @query {Integer} e_day End Day
 * @query {String} report_type=detail1 Report Type
 * @query {String} stores=all Stores
 * @query {String} action=report Action
 */
sales.get('/', (req, res) => {
  // Webdriver Client Instance
  const client = require('../../../webdriverio/client.js').client;
  const credentials = {
    user: conf.settings.clips4sale.user,
    pass: conf.settings.clips4sale.pass,
    phpsessid: conf.settings.clips4sale.phpsessid
  };
  const params = {
    client: client
  };

  c4s.login(credentials, params, function(err, data) {
    if (err) {
      res.status(401).send('Login Error.', err);
    }
    console.log("Logged in");
    salesHelper.getReport(credentials, params, req.query, function(err, data) {
      if (err) {
        console.log(err);
        res.send(401, err);
      } else {
        console.log(data);
        res.json(data);
      }
    });
  });
  /*   salesHelper.getReport(req.query, (err, data) => {
  	if (err) { callback(err, data); };
  	console.log(data);
  	res.status(200).json(data);
    }); */
});

module.exports = sales;
