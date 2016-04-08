var Docker	= require('dockerode') ,
	config	= require('common/config') ,
	log		= require('common/log') ;


var docker = new Docker();  //{socketPath: '/var/run/docker.sock'});

var image		= config.image ,
	port		= config.internal_port ,
	host_dir	= config.session_dir ,
	mount_name	= config.mount_name ;


function fire (info, cb) {
	info = info | {};
	cb = cb || function(){};
	log.debug ({ 
		method: 'create', 
		time: Date.now()
	});
	create ({ name: info.name }, function (err, container) {
		log.info ({ err: err, container: container}, 'created container');
		if (err){
			return cb (err);
		}

		log.debug ({ 
			method: 'attach', 
			time: Date.now()
		});
		attach (container, function (err, stream) {
			log.info ({ err: err, stream: 'skipping print'}, 'attached container');
			if (err) {
				return cb (err);
			}
			stream.pipe (process.stdout);					// enable  < logs --follow >

			log.debug ({ 
				method: 'start', 
				time: Date.now()
			});
			start (container, function (err, data) {
				log.debug ({ 
					method: 'done', 
					time: Date.now()
				});

				log.info ({ err: err, data: data}, 'started container');
				if (err) {
					return cb (err);
				}
				cb ('hogya');
			});
		});		
	});
}

function end (info, cb) {
	//	..:-- stop and remove the container --:..	//
}

module.exports = { 
	fire	: fire ,
	end		: end
};

/*
 *	private methods
 */

function create (info, cb) {
	info = info || {};
	log.debug ({ 
		'container name': info.name
	});
	var opts = {
		name	: info.name,
		tty		: true,
		publish	: port,
		Image	: image,
		Binds	: [ host_dir + ":" + mount_name ]
	};
	docker.createContainer (opts, cb);						// cb( err, container)
}
		
function attach (container, cb) {
	container.attach ({
		stream: true, 
		stdout: true,
		stderr: true
	}, cb);													// cb( err, stream)
	//stream.pipe( process.stdout);
}
				
function start (container, cb) {
	log.debug ('Binds: ' + host_dir + ":" + mount_name );
	container.start (null, cb);								// cb( err, data) 
}
