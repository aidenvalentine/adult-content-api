var hyperquest = require('hyperquest');
var fs = require('fs');
var path = require('path');
var Client = require('ftp');
var Minio = require('minio');
const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));

function upload(event, callback) {

  var dstFile = path.basename(event.url);

  console.log('File: ', dstFile)

  function search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].name === nameKey) {
        return myArray[i];
      }
    }
  }

  var ftpClient = new Client();

  ftpClient.connect({
    host: 'ftp.vod.com',
    user: conf.setting.hotmovies.user,
    password: conf.setting.hotmovies.pass
  });

  ftpClient.on('ready', function() {

    /* 		var src = request({
    			url: event.url,
    			method: "HEAD"
    		}, function(err, response, body) {
    			console.log(response.headers);
    			return response.headers;
    			// process.exit(0);
    		}); */
    // console.log(size);

    ftpClient.list('/', function(err, data) {
      // console.log(JSON.stringify(data, null, 2)); // Debug
      if (err) {
        console.log(err);
      }
      var obj = search(dstFile, data);
      console.log(obj);
      // console.log('File Size: ' + obj.size + ' Bytes');
      // console.log(src, obj.size);

      if (obj) {
        ftpClient.end();
        console.log('File already exists on destination server\'s filesystem.');
        callback(null, obj);
        // process.exit(0);
      } else {

        if (event.type == "video") {

          // Allow insecure TLS connections
          process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

          // Setup minio client
          var minioClient = new Minio.Client({
            endPoint: conf.setting.s3.endpoint,
            port: conf.setting.s3.port || 9000,
            useSSL: true,
            accessKey: conf.setting.s3.access_key,
            secretKey: conf.setting.s3.secret_key
          });

          var size = 0;

          // Grab our video file from an s3-compatible server and stream (dataStream)
          minioClient.getObject('vods', event.url, function(err, dataStream) {
            if (err) {
              return console.log(err)
            }
            dataStream.on('data', function(chunk) {
              size += chunk.length
            })
            dataStream.on('end', function() {
              console.log('End. Total size = ' + size)
            })
            dataStream.on('error', function(err) {
              console.log(err)
            })

            console.time("upload");

            // Pipe stream to destination FTP server
            ftpClient.put(dataStream, dstFile, function(err) {
              if (err) {
                console.log(err);
              }
              ftpClient.end();
              console.timeEnd("upload");
              console.log("Finished");
            });
          });
        } else {

          // Grab from HTTP request and stream
          var stream = hyperquest(event.url);
          console.time("upload");

          // Pipe stream to destination FTP server
          ftpClient.put(stream, dstFile, function(err) {
            if (err) {
              console.log(err);
            }
            ftpClient.end();
            console.timeEnd("upload");
            console.log("Finished");
          });
        }
      }
    });

  });

  var upload = function() {
    ftpClient.size(dstFile, function(err, size) {
      // Assuming the err is the file not existing, good enough for now
      // err.code will give the exact status code otherwise (550 is file not found)
      var stream = hyperquest('event.url');
      if (err) {

        hyperquest('event.url').pipe(res)(function(res) {
          // console.log(stream);
          ftpClient.put(stream, dstFile, function(err) {
            if (err) {
              console.log(err);
            }
            ftpClient.end();
            console.timeEnd("upload");
            console.log("Finished");
          });
        });

      } else {

        console.log("Resuming download at start: " + size);
        getFileFromS3(size, function(res) {

          ftpClient.append(res, dstFile, function(err) {
            if (err) {
              console.log(err);
            }

            ftpClient.end();
            console.timeEnd("upload");
            console.log("Finished");
          });
        });

      }
    });
  };

  ftpClient.on('close', function(hadError) {
    if (hadError) {
      console.log("FTP server closed with an error");
      // callback("FTP server closed with an error");
    } else {
      console.log("FTP server closed");
      // done();
    }
  });

  ftpClient.on('error', function(err) {
    console.log("FTP server had error: " + err);
  });


  ftpClient.on('end', function() {
    console.log("FTP server ended connection");
  });

  ftpClient.on('greeting', function(msg) {
    console.log(msg);
  });

}

function httpUpload(event, callback) {

  var dstFile = path.basename(event.url);
  var ext = path.extname(event.url);
  var dstPath;
  if (ext == ".mp4" || ".wmv" || ".mov" || ".avi") {
    dstPath = '/clips';
  } else if (ext == ".jpg" || ".gif" || ".png" || ".jpeg" || ".tiff" || ".tif") {
    dstPath = '/clip_images';
  }
  switch (event.type) {
    case "trailer":
      dstPath = '/clips_previews';
      break;
    case "video":
      dstPath = '/clips';
      break;
    case "poster":
      dstPath = '/clip_images';
      break;
  }
  console.log('File: ', dstFile)

  function search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].name === nameKey) {
        return myArray[i];
      }
    }
  }

  var ftpClient = new Client();

  ftpClient.connect({
    host: 'aebnftp.dataconversions.biz',
    user: event["credentials"][0]["user"] || process.env.AEBN_USER,
    password: event["credentials"][0]["pass"] || process.env.AEBN_PASS
  });

  ftpClient.on('ready', function() {

    /** Change directory on FTP server */
    ftpClient.cwd(dstPath, function(err, currentDir) {
      if (err) throw err;
      console.log(`Directory changed to ${dstPath}`);

      ftpClient.list(dstPath, function(err, data) {
        // console.log(JSON.stringify(data, null, 2)); // Debug
        if (err) {
          console.log(err);
        }
        var obj = search(dstFile, data);
        console.log(obj);
        // console.log('File Size: ' + obj.size + ' Bytes');
        // console.log(src, obj.size);

        if (obj) {
          ftpClient.end();
          console.log('File already exists on destination server\'s filesystem.');
          callback(null, obj);
          // process.exit(0);
        } else {

          // Grab from HTTP request and stream
          var stream = hyperquest(event.url);
          console.time("upload");

          // Pipe stream to destination FTP server
          ftpClient.put(stream, dstFile, function(err) {
            if (err) {
              console.log(err);
            }
            ftpClient.end();
            console.timeEnd("upload");
            console.log("Finished");
          });
        }
      });
    });
  });

  var upload = function() {
    ftpClient.size(dstFile, function(err, size) {
      // Assuming the err is the file not existing, good enough for now
      // err.code will give the exact status code otherwise (550 is file not found)
      var stream = hyperquest('event.url');
      if (err) {

        hyperquest('event.url').pipe(res)(function(res) {
          // console.log(stream);
          ftpClient.put(stream, dstFile, function(err) {
            if (err) {
              console.log(err);
            }
            ftpClient.end();
            console.timeEnd("upload");
            console.log("Finished");
          });
        });

      } else {

        console.log("Resuming download at start: " + size);
        getFileFromS3(size, function(res) {

          ftpClient.append(res, dstFile, function(err) {
            if (err) {
              console.log(err);
            }

            ftpClient.end();
            console.timeEnd("upload");
            console.log("Finished");
          });
        });

      }
    });
  };

  ftpClient.on('close', function(hadError) {
    if (hadError) {
      console.log("FTP server closed with an error");
      // callback("FTP server closed with an error");
    } else {
      console.log("FTP server closed");
      // done();
    }
  });

  ftpClient.on('error', function(err) {
    console.log("FTP server had error: " + err);
  });


  ftpClient.on('end', function() {
    console.log("FTP server ended connection");
  });

  ftpClient.on('greeting', function(msg) {
    console.log(msg);
  });

}

module.exports = {
  upload: upload,
  httpUpload: httpUpload
};
