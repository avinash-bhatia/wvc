var Docker	= require('dockerode') ,
	config	= require('common/config') ,
	log		= require('common/log') ;

var docker		= new Docker() ,
	image		= config.image ,
	port		= config.internal_port ,
	host_dir	= config.session_dir ,
	mount_name	= config.mount_name ;
	

var	list		= {} ;

function start( info){

	console.log({ docker : docker}, 'docker constructor run');

	docker.run(image, [], process.stdout,
	   {
		   Binds	: [ host_dir + ":" + mount_name ],
		   detached	: true ,
		   interactive: true,
		   tty		: true ,
		   publish	: port ,
		   name		: 'pawan_' 
	   },
	   function( err, data, container){		// not called immediately if no error
			console.log({
				err : err ,
				data : data ,
				container : container
			}, 'callback');
		})
		.on('container',function( container){
			console.log({
				container : container
			}, 'container event');
		})
		.on('data', function( data){		// not called immediately
			console.log({
				data : data
			}, 'data event');
		})
		.on('stream', function( stream){
			console.log({
				stream : stream
			}, 'stream event');
		});
};

function stop(){

};

module.exports = {
	start : start ,
	stop  : stop
};
