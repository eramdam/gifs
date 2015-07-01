#! /usr/local/bin/node
var exec = require('child_process').exec,
    util = require('util'),
    fs   =   require('fs'),
    path = require('path'),
    async = require('./async.js'),
    gifsPath = path.resolve(__dirname, '..');

var child = exec('find '+ gifsPath +' -name "*.gif" -o -name "*.png" -o -name "*.jpeg" -o -name "*.jpg"', listFiles);

function listFiles(err, out, stderr) {
  if (err !== null)
    return err;

  cb(out.split('\n'));
}

function cb(data) {
  data = data.filter(function (line) { return line !== ''; });
  data = data.filter(function (line) { return line.indexOf('_dist') === -1; });
  data = data.map(function (file) {
    return path.resolve(__dirname, file);
  });

  symlink(data);
}

function symlink(filePathArr) {
  // console.log(filePathArr);
  async.eachSeries(filePathArr, iterator, function (err) { if (err) throw err; });
}

var newpath,
    newfilename,
    filename;

function iterator (file, done) {
  filename = file.split('/').pop().replace("'","\'");
  newpath = path.resolve(file.replace('gifs/','gifs/_dist/'), '../..');
  newfilename = file.replace(/\/(?=[^\/]*$)/,'_').split('/').pop();
  if (!fs.existsSync(path.resolve(newpath, newfilename))) {
    exec("osascript -e 'tell application \"Finder\" to make alias file to POSIX file \""+file+"\" at POSIX file \""+newpath+"\"'", function (err, out, stderr) {
      if (err !== null)
        done(err);

      setTimeout(renameSingleFile, 0, done);
    });
  } else {
    console.log(newfilename, 'exists. Ignoring...');
    done(null);
  }
}



function renameSingleFile(done) {
  try {
    fs.renameSync(path.resolve(newpath, filename), path.resolve(newpath, newfilename));
    console.log('Symlinking', filename, 'to', newfilename);
  } catch (e) {
    console.log(e);
  }
  done(null);
}