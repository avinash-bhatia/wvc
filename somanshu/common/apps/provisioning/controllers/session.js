var $            = require('jquery-deferred');
var helpers      = require('common/helpers');
var ERR          = require('common/error');
var sched        = require('common/sched');
var sess_db      = require('provisioning/models/session-db');
var sess_pool    = require('provisioning/lib/sess-pool');
var host_pool    = require('provisioning/lib/host-pool');
var host         = require('provisioning/lib/host');
var mylog        = require('provisioning/common/log').child({ module : 'controllers/session'});

var controller = {};

/*
 * Request generated by the 'api-backend'. Supplies the full class configuration 
 * along with the request */
controller.start = function (req, res, next) {

	var class_config = req.body;

	req.log.debug ({ class_config : class_config }, 'session start request');
	res.send('ok');

	/*
	 * 0. Ack the request as OK, if basic validations pass. Any
	 *    errors encountered further downstream will only be 'heard'
	 *    by monitoring services.
	 * 1. Store the request in the DB
	 * 2. Choose the session host from the host pool
	 * 3. Send config & request
	 * 4. Update status in the DB.
	 * 5. Upon response from the session host, start the class state machine.
	 *
	 */
	sess_db.create (class_config)
		.then (host_pool.get,           update_db_and_fail.bind(null, class_config))
		.then (host.start,              update_db_and_fail.bind(null, class_config))
		.then (sess_db.update,          update_db_and_fail.bind(null, class_config));
};

function update_db_and_fail (c_config, err, failure_step, sess_record) {
	mylog.error ({
		detail : {
				 err : err,
				 failure_step : failure_step
			 }
	}, 'session start failed');

	sess_db.update_failure (sess_record, err, failure_step);
}

module.exports = controller;