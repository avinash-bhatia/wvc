var log		= require('common/log')  ;

var session = {};

session.start = function( req, res, next){
	res.send({ status : 'success', data : 'coming soon..'})
};

session.modify = function( req, res, next){
	res.send({ status : 'success', data : 'not coming soon..'});
};

session.kill = function( req, res, next){
	res.send({ status : 'success', data : 'not sure if it is even needed'});
};

module.exports = session;
