var mongoose = require('../mongo-conn');

var TokenSchema   = new mongoose.Schema({
	  value: { type: String, required: true },
	  clientId: { type: String, required: true }
});

module.exports = mongoose.model('Token', TokenSchema);
