var mongoose = require('../mongo-conn');

var client_schema = new mongoose.Schema({
	name : { type : String, unique : true, required : true },
	id : { type : String, required : true },
	secret : { type : String, required : true }
});

module.exports = mongoose.model('client', client_schema);
