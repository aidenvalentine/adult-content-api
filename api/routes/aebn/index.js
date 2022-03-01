var aebn = require('express').Router({
  mergeParams: true
});
var path = require('path');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// clips4sale Helper
const aebnHelper = require('./aebnHelper.js');

const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));

aebn.post('/', jsonParser, function(req, res) {
  var event = req.body;
  const credentials = {
    user: conf.settings.aebn.user,
    pass: conf.settings.aebn.pass
  };
  // console.log(req, res);
  event.credentials = [];
  event.credentials.push(credentials);
  console.log(event);
  aebnHelper.localUpload(req.body, function(err, data) {
    if (err) {
      callback(err, data);
    } else {
      console.log(data);
      res.status(200).json(data);
    }
  });
  // console.log(req.body);      // your JSON
  // res.send(req.body);    // echo the result back
});

module.exports = aebn;
