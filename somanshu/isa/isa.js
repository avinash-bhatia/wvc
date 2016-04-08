var jwt = require('jsonwebtoken');

var secret = "this_is_secret";
var requestor;
var isa = {};

isa.authenticate = function (req, res, next) {
	var token = req.headers['x-access-token'];

	if (token) {
		jwt.verify(token, secret, function(err, decoded) {
			if (err) {
				return res.status(406).send({ success: false, message: 'Failed to authenticate token.', err : err });
			}
			else {
				req.decoded = decoded;
				next();
			}
		});
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

		//generate token
		token = jwt.sign(requestor, secret, {expiresInMinutes: 2});
		return res.status(200).send({
			success : true,
			token   : token
		});
	}

	return res.status(401).send({ 
				success: false, 
				message: 'Credentials invalid'
	});
};

/* Local Methods  */
function valid_credential (req) {
	var token = req.headers.client_info;

	if (token) {
		jwt.verify(token, secret, function (err, decoded) {
			console.log('verify callback');
			if (err) {
				return false;
			}
			requestor = decoded;
			return true;
		});
	}

	return false;
}

module.exports = isa;
