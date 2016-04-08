var $		= require('jquery-deferred')  ,
	log		= require('common/log') ; 

var res = {}  ;

res.assert = function(){
	var _d = $.Deferred()
	/* 
	 * check if fluentd, docker and git are installed.. 
	 */
	_d.resolve();
	return _d.promise();
};

res.start = function( info){
	var _d = $.Deferred();

	_d.resolve();
	return _d.promise();
};

module.exports = res ;
