var rest = require('restler');
var jwt  = require('jsonwebtoken');
var secret = 'this_is_secret';
var r = [];
var requestor = {
	from : 'prov1',
	to   : 'node1'
};
var token = jwt.sign(requestor, secret);
//var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcm9tIjoicHJvdjEiLCJ0byI6Im5vZGUxIiwiaWF0IjoxNDYwMDIyMzI3fQ.-HLGW0oLKz0sW8JV9zRqM30QwnWU1csK_ap7KS2M5mw';
function make_request() {
	for (var i =0; i<5; i++) {
		//r[i] = rest.get('http://localhost:3000/api/users', { headers : { 'x-access-token' : token }});
		r[i] = rest.get('http://localhost:3000/isa/auth', { headers : { 'client_info' : token }});
		
		r[i].on('success', success);

		r[i].on('fail', fail);

		r[i].on('timeout', timeout);
	}
}

setInterval(make_request, 500); 
//make_request();

function success(data, response) {
		console.log('got response ::: '+ JSON.stringify(data));
}

function fail (data, response) {
		console.log('request failed');
		console.log(JSON.stringify(data));
}

function timeout (ms) {
		console.log('request timed out');
}
