var path    = require('path')
  , passzip = require('./index')
  , fs = require('fs');

fs.createReadStream('test.js').pipe(new passzip('1234', 'test_.js')).pipe(fs.createWriteStream('test.zip'));