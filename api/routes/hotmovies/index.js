var hotmovies = require('express').Router({
  mergeParams: true
});
const path = require('path');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// clips4sale Helper
const hotmoviesHelper = require('./hotmoviesHelper.js');

const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));

hotmovies.post('/', jsonParser, function(req, res) {
  var event = req.body;
  const credentials = {
    user: conf.settings.hotmovies.user,
    pass: conf.settings.hotmovies.pass
  };
  // console.log(req, res);
  event.credentials = [];
  event.credentials.push(credentials);
  console.log(event);
  hotmoviesHelper.upload(req.body, function(err, data) {
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

module.exports = hotmovies;
