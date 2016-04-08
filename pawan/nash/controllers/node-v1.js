var log		= require('common/log')  ;

var node = {};

node.acquire = function (req, res, next) {
	// start fluentd					// require('child_process').exec
	// check filesystem					// require('fs')
	// git clone ( what if same code exists, and what if their origin is different )		// require('simple-git')
	// download docker image			//dockerode.pull
	res.status = 102;
	res.send ({ 
		status: 'success', 
		data: 'coming soon..'
	});
};

node.update = function (req, res, next) {
	res.status = 200;
	res.send ({ 
		status: 'success', 
		data: 'not coming soon..'
	});
};

node.renounce = function (req, res, next) {
	res.status = 200;
	res.send({ 
		status : 'success', 
		data : 'not sure if it is even needed'
	});
};

/*  only after node_acquired, enable update and renounce */

module.exports = node;
