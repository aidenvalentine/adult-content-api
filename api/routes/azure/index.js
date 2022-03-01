var azure = require('express').Router({
  mergeParams: true
});
const path = require('path');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// Helper
const azureHelper = require('./azureHelper.js');

const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));

// API Key - Pre-authenticated
const apiKey = conf.settings.azure.api_key || "";

// Test Route
azure.get('/', (req, res) => {
  res.status(200).json({
    message: 'Azure Router!'
  });
});

// route to trigger the capture
azure.post('/translate', jsonParser, function(req, res) {
  var event = req.body;
  console.log(event);
  azureHelper.translate(event, apiKey, function(err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

module.exports = azure;
