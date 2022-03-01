var upload = require('express').Router({
  mergeParams: true
});
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

// upload Helper
const uploadHelper = require('./uploadHelper.js');

// Test Route
upload.get('/', (req, res) => {
  res.status(200).json({
    message: 'upload Router!'
  });
});

upload.post('/trailers', function(req, res) {
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

upload.post('/videos', function(req, res) {
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

upload.post('/thumbnails', function(req, res) {
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

/**
 * upload Router
 * @type {String}
 */
// upload.use('/sales', sales);

// upload.use('/influx', influx);

module.exports = upload;
