var spawn = (require('child_process')).spawn
  , path  = require('path')
  , fs    = require('fs');

module.exports = function (options, callback) {
  var zip = spawn('zip', ['-j', '-P', options.pass, options.to, options.from]);
  zip.on('exit', function (code, signal) {
    if (code && signal) return callback(new Error(signal));
    callback();
  }).on('error', callback);
}