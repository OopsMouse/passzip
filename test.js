var path    = require('path')
  , passzip = require('./index')
  , fs = require('fs');

fs.createReadStream('test.js').pipe(new passzip('1234')).pipe(fs.createWriteStream('test.zip'));