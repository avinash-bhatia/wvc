var Client = require('../models/client');

var client_api = {};

client_api.post = function (req, res) {
	var client = new Client();

	client.name   = req.body.name;
	client.id     = req.body.id;
	client.secret = req.body.secret;

	client.save(function (err)  {
		if (err) {
			res.send(err);
		}

		res.json({message : "client added", data : client});
	});
};

client_api.get = function (req, res) {
	Client.find({}, function(err, clients) {
		if (err) {
			res.send(err);
		}

		res.json(clients);
	});
};

module.exports = client_api;
