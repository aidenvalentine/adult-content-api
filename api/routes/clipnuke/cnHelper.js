var hyperquest = require('hyperquest');
var fs = require('fs');
var path = require('path');
const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));
var Client = require('ftp');
var Minio = require('minio');

// Allow insecure TLS connections
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// Make sure user has filled out necessary info.
if (conf.settings.s3.endpoint && conf.settings.s3.access_key && conf.settings.s3.secret_key) {
  // Setup minio client
  var minioClient = new Minio.Client({
    endPoint: conf.settings.s3.endpoint,
    port: conf.settings.s3.port || 9000,
    useSSL: conf.settings.s3.use_ssl || true,
    accessKey: conf.settings.s3.access_key,
    secretKey: conf.settings.s3.secret_key
  });
}

function getTrailerObjectKeys(params, callback) {
  var data = {};
  var size = 0;
  var bucketName = params.bucketName || 'clipnuke';
  data.objects = [];
  data.objects.push({
    name: "Select a File"
  });

  // Grab our video file from an s3-compatible server and stream (dataStream)
  /* 	minioClient.listObjects(bucketName, '', true, function(err, data) {
  		if (err) {
  			return console.log(err)
  		}
  		callback(null, data)
  	}, 3000); */

  var stream = minioClient.listObjects(bucketName, 'trailers/', true)
  stream.on('data', function(obj) {
    data.objects.push(obj);
    console.log(obj)
  });

  stream.on('error', function(err) {
    console.log(err)
    callback(err, data);
  });

  stream.on('end', function(err) {
    console.log(err)
    callback(null, data);
  });
}

function getVideoObjectKeys(params, callback) {
  var data = {};
  var size = 0;
  var bucketName = params.bucketName || 'xxxmultimedia-downloads';
  data.objects = [];
  data.objects.push({
    name: "Select a File"
  });

  // Grab our video file from an s3-compatible server and stream (dataStream)
  /* 	minioClient.listObjects(bucketName, '', true, function(err, data) {
  		if (err) {
  			return console.log(err)
  		}
  		callback(null, data)
  	}, 3000); */

  var stream = minioClient.listObjects(bucketName, '', true)
  stream.on('data', function(obj) {
    data.objects.push(obj);
    console.log(obj)
  });

  stream.on('error', function(err) {
    console.log(err)
    callback(err, data);
  });

  stream.on('end', function(err) {
    console.log(err)
    callback(null, data);
  });
}

function getVodObjectKeys(params, callback) {
  var data = {};
  var size = 0;
  var bucketName = 'vods';
  data.objects = [];
  data.objects.push({
    name: "Select a File"
  });

  // Grab our video file from an s3-compatible server and stream (dataStream)
  /* 	minioClient.listObjects(bucketName, '', true, function(err, data) {
  		if (err) {
  			return console.log(err)
  		}
  		callback(null, data)
  	}, 3000); */

  var stream = minioClient.listObjects(bucketName, '', true)
  stream.on('data', function(obj) {
    data.objects.push(obj);
    console.log(obj)
  });

  stream.on('error', function(err) {
    console.log(err)
    callback(err, data);
  });

  stream.on('end', function(err) {
    console.log(err)
    callback(null, data);
  });
}

module.exports = {
  getTrailerObjectKeys: getTrailerObjectKeys,
  getVideoObjectKeys: getVideoObjectKeys,
  getVodObjectKeys
};
