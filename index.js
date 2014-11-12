var spawn  = (require('child_process')).spawn
  , stream = require('stream')
  , util   = require('util')
  , path   = require('path')
  , fs     = require('fs')
  , uuid   = require('node-uuid');

var Transform = stream.Transform;

var tmp = function () {
  var filePath = path.join(process.env.TMPDIR, uuid.v4());
  if (fs.exists(filePath))
    return tmp();
  else
    return filePath;
};

function PassZip(pass) {
  this._pass = pass;
  this._bufferPath = tmp();
  this._bufferStream = fs.createWriteStream(this._bufferPath);

  Transform.call(this);
}

util.inherits(PassZip, Transform);

PassZip.prototype._archive = function (cb) {
  var zipPath = this._bufferPath + '.zip';
  var child = spawn('zip', ['-j', '-P', this._pass, zipPath, this._bufferPath]);
  
  child.on('exit', function (code, signal) {
    if (code && signal) {
      return cb(new Error(signal));
    }
    cb(null,  zipPath);
  });

  child.on('error', cb);
};

PassZip.prototype._transform = function (chunk, enc, cb) {
  this._bufferStream.write(chunk);
  cb();
};

PassZip.prototype._flush = function (cb) {
  var _this = this;
  this._archive(function (err, zipPath) {
    if (err) return cb(err);
    
    var zipReadStream = fs.createReadStream(zipPath);

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