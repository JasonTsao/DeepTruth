var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var async = require('async');

var FfmpegCommand = require('fluent-ffmpeg');
var command = new FfmpegCommand();

var uploading = multer({
  dest: __dirname + '/../public/uploads/',
  limits: {fileSize: 100000000, files:1},
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('upload', { title: 'Deep Truth' });
});

router.get('/stats', function(req, res, next) {
  res.render('video_stats', { videoID: req.query.file });
});

router.get('/video/words', function(req, res, next) {
  var tasks = {};

  tasks.extractAudio = function(callback) {
    return callback();
  }
  tasks.watsonTone = ["extractAudio", function(callback) {
    return callback();
  }];

  var postProcess = function(error, result) {
      res.json({ success: true});
  }
  async.auto(tasks, postProcess);
});

router.post('/upload', uploading.any(), function(req, res, next) {
  var metaData = req.files[0];
  // get the temporary location of the file
  var tmp_path = metaData.path;

  metaData.filename = metaData.filename + '.mov';
  // set where the file should actually exists - in this case it is in the "images" directory
  var target_path = __dirname + '/../public/uploads/' + metaData.filename;
  // move the file from the temporary location to the intended location
  fs.rename(tmp_path, target_path, function(err) {
      if (err) throw err;
      // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
      fs.unlink(tmp_path, function() {
          if (err) throw err;
          res.redirect('/stats?file=' + metaData.filename);
      });
  });
});

module.exports = router;
