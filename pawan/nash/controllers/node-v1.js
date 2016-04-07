var log		= require('common/log')  ;

var node = {};

node.acquire = function( req, res, next){
	res.send({ status : 'success', data : 'coming soon..'})
};

node.update = function( req, res, next){
	res.send({ status : 'success', data : 'not coming soon..'});
};

node.renounce = function( req, res, next){
	res.send({ status : 'success', data : 'not sure if it is even needed'});
};

module.exports = node;
