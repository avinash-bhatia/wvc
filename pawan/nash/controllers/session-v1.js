var log		= require('common/log')  ,
	_events	= require('common/events') ;

var session = {};

function start (req, res, next) {
	res.status = 102;		// send processing so as to avoid client timeout
	res.send({ status : 'success', data : 'coming soon..'})
};

function modify (req, res, next) {
	res.status = 200;
	res.send({ status : 'success', data : 'not coming soon..'});
};

function kill (req, res, next) {
	res.status = 200;
	res.send({ status : 'success', data : 'not sure if it is even needed'});
};


session.start = session.modify = session.kill = function (req, res, next) {
	res.status = 403 ;			// forbidden
	res.send({ status: 'error', data: 'node not yet acquired'});
}

/*
_events.on('node_acquired', function(){
	session.start	= start;
	session.mofify	= modify;
	session.kill	= kill;
});
*/

module.exports = /*session;*/ { start: start, modify: modify, kill: kill };
