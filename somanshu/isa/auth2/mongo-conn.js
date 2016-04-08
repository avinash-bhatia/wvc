var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/oauth_test');

module.exports = mongoose;
