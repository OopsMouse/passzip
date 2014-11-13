var spawn  = (require('child_process')).spawn
  , stream = require('stream')
  , util   = require('util')
  , path   = require('path')
  , fs     = require('fs')
  , uuid   = require('node-uuid');

var Transform = stream.Transform;

var tmpDir = function () {
  var dirPath = path.join(process.env.TMPDIR, uuid.v4());
  if (fs.exists(dirPath))
    return tmpDir();
  
  fs.mkdirSync(dirPath);
  return dirPath;
};

function PassZip(password, filename) {
  this._password = password;
  
  var _tmpDir = tmpDir();
  var _filename = filename || 'tmp.txt';

  this._bufferPath = path.join(_tmpDir, _filename);
  this._zipPath = path.join(_tmpDir, 'tmp.zip');
  
  this._bufferStream = fs.createWriteStream(this._bufferPath);

  Transform.call(this);
}

util.inherits(PassZip, Transform);

PassZip.prototype._archive = function (cb) {
  var child = spawn('zip', ['-j', '-P', this._password, this._zipPath, this._bufferPath]);
  
  child.on('exit', function (code, signal) {
    if (code && signal) {
      return cb(new Error(signal));
    }
    cb();
  });

  child.on('error', cb);
};

PassZip.prototype._transform = function (chunk, enc, cb) {
  this._bufferStream.write(chunk);
  cb();
};

PassZip.prototype._flush = function (cb) {
  var _this = this;
  this._archive(function (err) {
    if (err) return cb(err);
    
    var zipReadStream = fs.createReadStream(_this._zipPath);

    zipReadStream.on('readable', function () {
      var chunk;
      while (null !== (chunk = zipReadStream.read())) {
        _this.push(chunk);
      }
    });

    zipReadStream.on('end', function () {
      cb();
    });

    zipReadStream.on('error', cb);
  });
};

module.exports = PassZip;