var $    = require('jquery-deferred');
var rest = require('restler');

var isa_client = {};

isa_client.get_token = function (url) {
	var _d = $.Deferred();
	var d = rest.get ( url + '/token', { headers : {'client_id' : 'somanshu', 'client_secret' : '12345'}} );

	d.on('success', function (data, response) {
		console.log('success');
		console.log(JSON.stringify(data));
		this.token_list[url] = data.token;
		_d.resolve(data.token);
	});
	d.on('fail', function (data, response) {
		console.log('fail');
		console.log(JSON.stringify(data));
	});
	d.on('error', function (err, response) {
		console.log('error');
		console.log(JSON.stringify(err));
	});
	d.on('timeout', function (ms) {
		console.log('timeout');
		console.log('ms = '+ ms);
	});

	return _d.promise();
};

isa_client.refresh_token = function (url) {
	//send the token to the server and server checks that if token expired decode to get username and password and verify it and generate new token and send it as response to the request
};

isa_client.token_list = {};

function call_api (token) {
	url = 'http://localhost:3000/api';
	var d = rest.get ( url, { headers : { 'x-access-token' : token }});

	d.on('success', function (data, response) {
		console.log('success');
		console.log(JSON.stringify(data));
	});
	d.on('fail', function (data, response) {
		console.log('fail');
		console.log(JSON.stringify(data));
	});
	d.on('error', function (err, response) {
		console.log('error');
		console.log(JSON.stringify(err));
	});
	d.on('timeout', function (ms) {
		console.log('timeout');
		console.log('ms = '+ ms);
	});
}

get_token().then(call_api, function (err) {
	    console.log('err = '+ err);
});
