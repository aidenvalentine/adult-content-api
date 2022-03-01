var adultempire = require('express').Router({
  mergeParams: true
});
var path = require('path');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// clips4sale Helper
const adultempireHelper = require('./adultempireHelper.js');

const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));

adultempire.post('/', jsonParser, function(req, res) {
  if (!req.headers.authorization || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    res.status(401).send('Missing Authentication Method.');
  } else {
    var event = req.body;
    const credentials = {
      user: conf.settings.adultempire.user,
      pass: conf.settings.adultempire.pass
    };
    // console.log(req, res);
    event.credentials = [];
    event.credentials.push(credentials);
    console.log(event);
    adultempireHelper.upload(req.body, function(err, data) {
      if (err) {
        callback(err, data);
      } else {
        console.log(data);
        res.status(200).json(data);
      }
    });
    // console.log(req.body);      // your JSON
    // res.send(req.body);    // echo the result back
  }
});

module.exports = adultempire;
