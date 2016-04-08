var jwt = require('jsonwebtoken');
var $ = require('jquery-deferred');
var cache = require('./cache').init('isa');
var secret = "this_is_secret";
var requestor;
var isa = {};
var map = {};

isa.authenticate = function (req, res, next) {
	var token = req.headers['x-access-token'];

	if (token) {
		cache.get(token)
			.then(
				function (val) {
					if (!val) {
						console.log('val not found');
						return res.status(403).send({
							success : false,
							msg : 'forbidden'
						});
					}

					return res.status(200).send({
						success : true,
						token   : token
					});
				},
				function (err) {
					console.log('authenticate cache err :::' + err);
					return res.status(403).send({
						success : false,
						token   : 'forbidden'
					});
				}
				);
	}

	else {
		return res.status(403).send({ 
			success: false,
			message: 'No token provided'
		});
	}
};

isa.create_token = function (req, res, next) {
	if (valid_credential(req)) {

		//Check if token already created
		//console.log('valid credentials');
		//console.log(JSON.stringify(map));
		var from = requestor.from;
		var to = requestor.to;
		var token;
		
		if (map[from+'_'+to]) {
			token = map[from+'_'+to];
		}

		if (token) {
			//console.log('found in the token_map');
			
			cache.get(token)
				.then(
					function (val) {
						if (!val) {
							//console.log('No value of token');
							token = new_token();
						}
						//console.log('________________________________________');

						//console.log('|returning existed token ::: cache hit |');
						//console.log('________________________________________');

						return res.status(200).send({
							success : true,
							token   : token
						});
					},
					function (err) {
						console.log('________________________________________');
						console.log('| error getting token::cache miss      |');
						console.log('________________________________________');
						token = new_token();
						return res.status(200).send({
							success : true,
							token : token
						});
					}
				);
		}

		else {
			//console.log('not present in token map');
			token = new_token();
			return res.status(200).send({
				success : true,
				token : token
			});
		}

	}

	else {

		return res.status(401).send({ 
					success: false, 
					message: 'Credentials invalid'
		});
	}
};

cache.redis.on('connect', function () {
	console.log('connected to redis');
	var i=0;
	//token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcm9tIjoicHJvdjEiLCJ0byI6Im5vZGUxIiwiaWF0IjoxNDYwMDIyMzI3fQ.-HLGW0oLKz0sW8JV9zRqM30QwnWU1csK_ap7KS2M5mw';
//	for (var i=0; i<1000;i++) {
	setInterval( function(){
		token = jwt.sign({ 'from' : 'prov::', 'to' : 'to::' }, secret, {expiresInMinutes : 1});
		cache.set(token, 'my token::'+ i++);
	}, 100);
});

/* Local Methods  */
function new_token () {
	//generate token
	console.log('_____________________________________________________________________');
	console.log('_____________________________________________________________________');
	console.log('_____________________________________________________________________');
	console.log('|creating new token for requestor ::'+ JSON.stringify(requestor) + '|');
	console.log('_____________________________________________________________________');
	console.log('_____________________________________________________________________');
	token = jwt.sign(requestor, secret, {expiresInMinutes: 1});
	map[requestor.from+'_'+requestor.to] = token;
	console.log('added to map :::'+JSON.stringify(map));
	cache.set(token, requestor, 60);
	return token;
}

function valid_credential (req) {
	var token = req.headers.client_info;

	if (token) {
		/*jwt.verify(token, secret, function (err, decoded) {
			if (err) {
				console.log('token verify error');
				return false;
			}
			requestor = decoded;
			return true;
		});*/
		try {
			var result = jwt.verify(token, secret);
			//console.log(JSON.stringify(result));
			requestor = result;
			return true;
		}
		catch(err) {
			console.log(err);
			return false;
		}

	}

	console.log('no client_info found');
	return false;
}

module.exports = isa;
