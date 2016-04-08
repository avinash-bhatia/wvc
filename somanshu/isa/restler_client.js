var restler = require('restler');
var emitter = require('./emitter');
var token_map = require('./token_map');

var restler_client = {};

restler_client.get = function (from, to, url, headers) {
	var token = token_map.find(from, to);
	if (token) {
		var token_header = { 'x-access-token' : token };
		var r_get = restler.get(url, options);
		r_get.on('success', function (data, response) {
		});
		r_get.on('fail', fail_handler);
		return emitter;
	}
	err = { msg : 'Need to initialize the isa before making get/post request' };
	return err;
};

restler_client.post = function (url, headers, data) {
	var r_post = restler.post(url, { headers : headers }, { data : data });
	return emitter;
};

function success_handler (data, response) {
	//handle what to do on success
	emitter.emit('success', data, response);
}

function fail_handler (data, response) {
	//Get new token if token is expired
	//if able to get new token remake the same request with the new token
	//else emit fail
}

function remake_request (url, headers) {
}

module.exports = restler_client;
