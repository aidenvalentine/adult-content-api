const local = require('express').Router({
  mergeParams: true
});
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const conf = require(path.join(process.env.APPDATA, "clipnuke", "config.json"));
const spawn = require('child_process').spawn;

// clips4sale Helper
// const localHelper = require(path.join(__dirname, 'localHelper.js'));

// Test Route
local.get('/', (req, res) => {
  res.status(200).json({
    message: 'Local API'
  });
});

// List Clips
local.get('/files', function(req, res) {
  // Where our files are stored
  const directoryPath = path.join(conf.settings.local.dir.videos || "%USERPROFILE%/Videos"); // TODO change to var
  //passsing directoryPath and callback function
  fs.readdir(directoryPath, function(err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    var arr = [];
    var itemsProcessed = 0;

    function callback() {
      res.status(200).json({
        files: arr
      });
      console.log('all done');
    }
    //listing all files using forEach
    files.forEach(function(file, index, array) {
      // Do whatever you want to do with the file
      arr.push(file);
      console.log(file);
      itemsProcessed++;
      if (itemsProcessed === array.length) {
        callback();
      }
    }, arr);
  }, res);
});

// List Clips
local.post('/ffmpeg/transcode', jsonParser, function(req, res) {
  const event = req.body;
  const input = event.input;
  var input_path = path.dirname(input);
  var basename = path.basename(input, ".mxf");
  const ext = path.extname(input);
  // const path = path.parse(event.input);
  // const filename = req.body.input;
  var cmd = "";
  const child1 = spawn('ffmpeg', ['-i', `${input}`, '-i', conf.settings.ffmpeg.watermark.hd, '-filter_complex', '[0:v]scale=1920:1080[scaled];[scaled][1:v]overlay=0:0', '-c:v', 'h264_nvenc', '-profile:v', 'main', '-level:v', '4.1', '-c:a', 'copy', '-acodec', 'aac', '-ab', '128k', '-b:v', '6000k', `${input_path}/${basename}_hd.mp4`]);
  const child2 = spawn('ffmpeg', ['-i', `${input}`, '-i', conf.settings.ffmpeg.watermark.sd.mp4, '-filter_complex', '[0:v]scale=720:480[scaled];[scaled][1:v]overlay=0:0', '-c:v', 'h264_nvenc', '-profile:v', 'main', '-level:v', '3.0', '-c:a', 'copy', '-acodec', 'aac', '-ab', '128k', '-b:v', '2500k', `${input_path}/${basename}_sd.mp4`]);
  const child3 = spawn('ffmpeg', ['-i', `${input}`, '-i', conf.settings.ffmpeg.watermark.hd, '-filter_complex', '[0:v]scale=1920:1080[scaled];[scaled][1:v]overlay=0:0', '-b', '6000k', '-vcodec', 'wmv2', '-acodec', 'wmav2', `${input_path}/${basename}_hd.wmv`]);
  const child4 = spawn('ffmpeg', ['-i', `${input}`, '-i', conf.settings.ffmpeg.watermark.sd.wmv, '-filter_complex', '[0:v]scale=854:480[scaled];[scaled][1:v]overlay=0:0', '-b', '2000k', '-vcodec', 'wmv2', '-acodec', 'wmav2', `${input_path}/${basename}_sd.wmv`]);
  child1.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
    if (code === 0) {
      res.status(200).json({
        message: 'FFMpeg/transcode ran successfully.'
      });
    } else {
      res.status(200).json({
        message: `Error Code ${code}`,
        code: code
      });
    }
  });
  child1.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    // res.status(200).json(data);
  });
  child1.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    // res.status(400).json(data);
  });
});

module.exports = local;
