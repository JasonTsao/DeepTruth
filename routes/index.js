var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var async = require('async');
var http = require('http');
var watson = require('watson-developer-cloud');

var ffmpeg = require('fluent-ffmpeg');

var uploading = multer({
  dest: __dirname + '/../public/uploads/',
  limits: {fileSize: 100000000, files:1},
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('upload', { title: 'Deep Truth' });
});

router.get('/stats', function(req, res, next) {
  res.render('video_stats', { videoName: req.query.file });
});

router.get('/video/words', function(req, res, next) {
  var tasks = {};
  var videoName = req.query.videoName || '';

  if (!videoName) {
    res.json({success: false});
  }

  console.log('video name is: ' + videoName);

  /*var dasWords = [ { text: 'I', size: 20 },
  { text: 'wanted', size: 20 },
  { text: 'to', size: 20 },
  { text: 'place', size: 20 },
  { text: 'this', size: 40 },
  { text: 'award', size: 20 },
  { text: 'on', size: 20 },
  { text: 'the', size: 60 },
  { text: 'podium', size: 20 },
  { text: 'next', size: 20 },
  { text: 'of', size: 20 },
  { text: 'vehicle', size: 20 },
  { text: 'that', size: 20 },
  { text: 'you', size: 40 },
  { text: 'think', size: 20 },
  { text: 'was', size: 20 },
  { text: 'ranked', size: 20 },
  { text: 'highest', size: 40 },
  { text: 'in', size: 60 },
  { text: 'initial', size: 40 },
  { text: 'quality', size: 40 },
  { text: 'when', size: 20 },
  { text: 'JD', size: 40 },
  { text: 'power', size: 40 },
  { text: 'is', size: 20 },
  { text: 'are', size: 20 },
  { text: 'wrong', size: 20 },
  { text: 'rank', size: 20 },
  { text: 'Malibu', size: 20 },
  { text: 'Silverado', size: 20 },
  { text: 'halftime', size: 20 },
  { text: 'and', size: 20 },
  { text: 'equinox', size: 20 },
  { text: 'their', size: 20 },
  { text: 'second', size: 20 },
  { text: 'that\'s', size: 20 },
  { text: 'impressive', size: 20 },
  { text: 'well', size: 20 },
  { text: 'Chevy', size: 20 },
  { text: 'hit', size: 20 },
  { text: 'three', size: 20 },
  { text: 'home', size: 20 },
  { text: 'runs', size: 20 },
  { text: '', size: 20 } ]

  res.json({words: dasWords});*/

  tasks.extractAudio = function(callback) {
    console.log('extracting audio!');
    var command = ffmpeg(__dirname + '/../public/uploads/' + videoName + '.mov')
                  .audioCodec('pcm_s16le').audioChannels(2)
                  .output(__dirname + '/../public/uploads/' + videoName + '.wav');
    command.run();

    setTimeout(callback, 10000);
  }
  tasks.watsonTone = ['extractAudio', function(callback) {
    console.log('watson toning!');
    var words = [];
    //var url = "https://stream.watsonplatform.net/speech-to-text/api/v1/recognize";
    var watson = require('watson-developer-cloud');
    var speech_to_text = watson.speech_to_text({
      username: '65322d99-a10b-414d-bb8e-27cd236d7c4f',
      password: 'YT2MPahfrzcn',
      version: 'v1'
    });

    var params = {
      audio: fs.createReadStream(__dirname + '/../public/uploads/' + videoName + '.wav'),
      content_type: 'audio/wav',
      timestamps: true,
      word_alternatives: 0.9
    };

    speech_to_text.recognize(params, function(err, transcript) {
      if (err)
        console.log(err);
      else
        console.log(JSON.stringify(transcript, null, 2));

      var results = transcript.results || [];

      if (results.length > 0) {
        var alternatives = results[0].alternatives || [];

        if (alternatives.length > 0) {

          if (alternatives[0].transcript.length > 0) {
            words = alternatives[0].transcript.split(" ");
          }
        }
      }

      return callback(null, words);
    });
  }];

  tasks.bundleWordCounts = ['watsonTone', function(callback, result) {
    var wordCounts = {};
    var wordCountsArr = [];

    result.watsonTone.forEach(function(word) {
      if (wordCounts[word]) {
        wordCounts[word] += 1;
      } else {
        wordCounts[word] = 1;
      }
    })

    wordCountsArr = Object.keys(wordCounts).map(function(key) {
        return {
          text: key,
          size: wordCounts[key] * 20
        };
    });

    console.log('wordCountsArr');
    console.log(wordCountsArr);

    return callback(null, wordCountsArr);
  }];

  var postProcess = function(error, result) {
      if (error) {
        console.log('error processing sound from video file: ' + error);
        return res.json({success: false});
      }

      res.json({ words: result.bundleWordCounts || []});
  }
  async.auto(tasks, postProcess);
});

router.post('/upload', uploading.any(), function(req, res, next) {
  var metaData = req.files[0];
  // get the temporary location of the file
  var tmp_path = metaData.path;

  metaData.filename = metaData.filename;
  // set where the file should actually exists - in this case it is in the "images" directory
  var target_path = __dirname + '/../public/uploads/' + metaData.filename + '.mov';

  console.log('metaData.filename = ' + metaData.filename);
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
