var clipnuke = require('express').Router({
  mergeParams: true
});
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var bearerToken = require('express-bearer-token')
var jsonParser = bodyParser.json()
// var influx = require('./influx');
var upload = require('./upload');

// clipnuke Helper
const cn = require('./cnHelper.js');

// Middleware
clipnuke.use(cookieParser())
clipnuke.use(bearerToken());

// Test Route
clipnuke.get('/', (req, res) => {
  res.status(200).json({
    message: 'clipnuke Router!'
  });
});

clipnuke.get('/trailers', function(req, res) {
  var event = req.body;
  // res.json({id});

  const params = {
    // accessKey: event.accessKey,
    // secretKey: event.secretKey
  };

  cn.getTrailerObjectKeys(params, function(err, data) {
    console.log(data);
    res.json(data);
  });

});

clipnuke.get('/videos', function(req, res) {
  var event = req.body;
  // res.json({id});

  const params = {
    // accessKey: event.accessKey,
    // secretKey: event.secretKey
  };

  cn.getVideoObjectKeys(params, function(err, data) {
    console.log(data);
    res.json(data);
  });

});

clipnuke.get('/vods', function(req, res) {
  var event = req.body;
  // res.json({id});

  const params = {
    // accessKey: event.accessKey,
    // secretKey: event.secretKey
  };

  cn.getVodObjectKeys(params, function(err, data) {
    console.log(data);
    res.json(data);
  });

});

clipnuke.get('/buckets', function(req, res) {
  var event = req.body;
  console.log('Cookies: ', req.cookies)

  // res.json({id});

  const params = {
    // accessKey: event.accessKey,
    // secretKey: event.secretKey
  };

  cn.getBuckets(params, function(err, data) {
    console.log(data);
    res.json(data);
  });

});

clipnuke.get('/test', function(req, res) {
  var event = req.body;
  console.log('Cookies: ', req.cookies)
  console.log('Token: ', req.token)

  res.send('Token ' + req.token);

});

/**
 * clipnuke Router
 * @type {String}
 */
// clipnuke.use('/sales', sales);

// clipnuke.use('/influx', influx);
clipnuke.use('/upload', upload);

module.exports = clipnuke;
