/*--------------------------* 
 * _docker manager module_	*
 *--------------------------*/
require('app-module-path').addPath( __dirname);		/* to avoid '../'s in require stmts */

var express		= require('express') ;

var app			= express() ,
	port		= '7088' ,
	docker		= require('core/docker') ,
	container	= require('core/container') ; 

//docker.start();

container.fire();//{ name: 'kritik'});

app.listen( port);

