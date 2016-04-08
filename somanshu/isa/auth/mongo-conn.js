var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/beerlocker');

module.exports = mongoose;
