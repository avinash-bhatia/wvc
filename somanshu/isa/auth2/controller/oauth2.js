var oauth2orize = require('oauth2orize');
var Client      = require('../models/client');
var Token       = require('../models/token');

var server = oauth2orize.createServer();

server.serializeClient(function(client, callback) {
	return callback(null, client._id);
});

server.deserializeClient(function(id, callback) {
	Client.findOne({ _id: id }, function (err, client) {
		if (err) { return callback(err); }
		return callback(null, client);
	});
});

// Exchange authorization codes for access tokens
server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, callback) {
				var token = new Token({
				value: uid(256),
				clientId: client.id,
			});

			token.save(function (err) {
				if (err) { return callback(err); }

				callback(null, token);
			});
}));

// Application client token exchange endpoint
exports.token = [
	server.token(),
	server.errorHandler()
];

// Local methods
function uid (len) {
	var buf = [];
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charlen = chars.length;
	
	for (var i = 0; i < len; ++i) {
		buf.push(chars[getRandomInt(0, charlen - 1)]);
	}
	
	return buf.join('');
}

function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
}
