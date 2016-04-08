var isa_client = {};
var token_map  = {};
var rest = require('./restler_client');

isa_client.get_token = function (url, from, to) {
	var r_get = rest.get(url, options);
	
	r_get.on('success', function (data, response) {
		token_map.add(from, to, data.token, url);
	});
};
module.exports = isa_client;
