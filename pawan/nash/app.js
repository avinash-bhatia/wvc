/*--------------------------------*
 *  _node_administrator_server_   *
 *--------------------------------*/
require('app-module-path').addPath( __dirname);		/* to avoid '../'s in require stmts */

var express		= require('express') ,
	bodyParser	= require('body-parser') ,
	node		= require('routes/node-v1') ,
	session		= require('routes/session-v1') ,
	resources 	= require('resources')  ,
	log 	  	= require('common/log')  ;

var app 	= express()  ,
	_port 	= '7098'  ;

app.use( bodyParser.json() );

app.use('/controller/v1/node', node);

app.use('/controller/v1/session', session);

app.use( function(err, req, res, next){				// how exactly will it be used.  I guess unmatched routes end up here
	res.status( err.status || 500);
	res.send({ 'status':'error', 'data': err });
	log.warn({ 'status':'error', 'data': err }, 'app.js');
});

resources.assert()				// will check for git, fluent etc  (maybe)
.then(
	start,
	exit
);

function start(){
	log.log('\n**************************');
	log.info('Started, listening on: '+ _port);
	log.log('**************************\n');
	app.listen(_port);
}

function exit( msg){
	log.err({'exit message ' : msg },' Exiting app');
	process.exit(1);
}

