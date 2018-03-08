var sales = require('express').Router({ mergeParams: true });
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// clips4sale Helper
const salesHelper = require('./salesHelper.js');

// Test Route
sales.get('/', (req, res) => {
  salesHelper.getReport(params, (err, data) => {
    if (err) { callback(err, data); };
    console.log(data);
    res.status(200).json(data);
  });
});

module.exports = sales;
