var Docker	= require('dockerode') ,
	config	= require('common/config') ,
	log		= require('common/log') ;


var docker = new Docker();  //{socketPath: '/var/run/docker.sock'});

var image		= config.image ,
	port		= config.internal_port ,
	host_dir	= config.session_dir ,
	mount_name	= config.mount_name ;

function create( info, cb){
	info = info || {};
	log.debug('container name: '+ info.name);
	var opts = {
		name	: info.name,
		tty		: true,
		publish	: port,
		Image	: image,
		Binds	: [ host_dir + ":" + mount_name ]
	};
	docker.createContainer( opts, cb);						// cb( err, container)
}
		
function attach( container, cb){
	container.attach({
		stream: true, 
		stdout: true,
		stderr: true
	}, cb);													// cb( err, stream)
	//stream.pipe( process.stdout);
}
				
function start( container, cb){
	log.debug('Binds: ' + host_dir + ":" + mount_name );
	container.start( null, cb);								// cb( err, data) 
}

function fire( info, cb){
	info = info | {};
	cb = cb || function(){};
	create({ name: info.name }, function(err, container){
		log.info({ err: err, container: container}, 'created container');
		if( err){
			return cb(err);
		}
		attach( container, function( err, stream){
			log.info({ err: err, stream: 'skipping print'}, 'attached container');
			if( err){
				return cb(err);
			}
			//stream.pipe( process.stdout);					// enable  < logs --follow >
			start( container, function( err, data){
				log.info({ err: err, data: data}, 'started container');
				if( err){
					return cb(err);
				}
				cb('hogya');
			});
		});		
	});
}

module.exports = { 
	fire : fire
};
