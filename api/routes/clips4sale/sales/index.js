var sales = require('express').Router({ mergeParams: true });
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// clips4sale Helper
const salesHelper = require('./salesHelper.js');

// test data
// var params = {
//   s_year: 2018,
//   s_month: 03,
//   s_day: 01,
//   e_year: 2018,
//   e_month: 03,
//   e_day: 08,
// };

// Test Route
/**
 * [exports description]
 * @type {[type]}
 * @query {Integer} s_year Start Year
 * @query {Integer} s_month Start Month
 * @query {Integer} s_day Start Day
 * @query {Integer} e_year Start Year
 * @query {Integer} e_month Start Month
 * @query {Integer} e_day Start Day
 * @query {String} report_type=detail1 Report Type
 * @query {String} stores=all Stores
 * @query {String} action=report Action
 */
sales.get('/', (req, res) => {
  salesHelper.getReport(req.query, (err, data) => {
    if (err) { callback(err, data); };
    console.log(data);
    res.status(200).json(data);
  });
});

module.exports = sales;
