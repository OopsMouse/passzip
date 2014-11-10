var path    = require('path')
  , passzip = require('./index');

passzip({
	pass: '1234',
	from: path.join(__dirname, 'test.js'),
	to: path.join(__dirname, 'test.zip')
}, function (err) {
	if (err) console.error(err);
});