var $               = require("jquery-deferred");
var log             = require("../common/log");
var config          = require("../config");
var users           = require("./users");
var addr            = require("./addr");

var list = {};
var res = {};
var resource_count = {};		//-pawan

res.load = function (sess_info) {

	var _d        = $.Deferred ();
	var resources = sess_info.resources;
	var common    = sess_info.common;
	var counter   = resources.length;
	resource_count= resources.length;	//added -pawan

	function mod_ok () {
		counter--;
		log.info ('resources:module.init: \"' + this + '\" ok');
		if (!counter)
			finish();
	}

	function mod_err (err) {
		counter--;
		log.error ('resources:module.init: \"' + this + '\" err = ' + err);
		if (!counter)
			finish();
	}

	function finish () {
		log.info('all modules resolve done !!!!!!!!!!!');
		_d.resolve ();
	}

	if (!resources) {
		log.error ('resources: resources not defined in sess_info');
		return;
	}

	for (var i = 0; i < resources.length; i++) {
		var r = resources[i];

		list[r.name] = {};

		/* Add additional utility handles */
		sess_info.handles = {};
		sess_info.handles.log = log;
		sess_info.handles.coms = {};
		sess_info.handles.coms.broadcast_info = users.broadcast_info.bind (users, r.name, r.name);

		try {
			list[r.name].handle = require('./resources/' + r.name + '/main.js');
			list[r.name].handle.init (r, common, sess_info.handles)
				.then (mod_ok.bind(r.name), mod_err.bind(r.name));
		}
		catch (e) {
			mod_err.call(r.name, e);
			delete list[r.name];
		}
	}

	return _d.promise ();
};

res.init_user = function (user) {
	var _d        = $.Deferred ();
	var d_arr     = [];
	var info      = {};
	var info_err  = {};
	var counter   = resource_count;//list.length;// 0;	//-pawan
	log.warn('DONOT commit....I changed counter logic here', '- pawan'  );
	function mod_ok (m, data) {
		info[m] = data;
		counter--;
		if (!counter)
			finish ();
	}

	function mod_err (m, err) {
		info_err[m] = err;
		counter--;
		if (!counter)
			finish ();
	}

	function finish () {
		log.info('resolved init_user ',JSON.stringify(info));
		//console.log('resolved : ' + JSON.stringify(info) + "\r\n err:" + JSON.stringify(info_err) );
		_d.resolve ({
			info : info,
			info_err : info_err
		});
	}

	for (var m in list) {
		if (list[m].handle.init_user) {
			var d_mod;
			//console.log('list entry: ' + list[m]);
			try {
				d_mod = list[m].handle.init_user (user);
			}
			catch (e) {
				log.error ('resources:init_user: \"' + m + '\" err = ' + e);
			}

			if (d_mod) {
//				counter++;     //-pawan
				log.info('counter : ', counter);
				d_mod.then (
					mod_ok.bind(d_mod, m),
					mod_err.bind(d_mod, m)
				);
			}
		}
	}

	return _d.promise ();
};

res.route_info = function (from, to, msg) {
	if (!list[to]) {
		log.error ('resources.route_info: info for non-existent module \"' + to + '\"');
		return;
	}

	if (!list[to].handle.info) {
		log.error ('resources.route_info: info method undefined for module \"' + to + '\"');
		return;
	}

	var user = addr.user(from);

	if (!user) {
		log.error ('resources.route_info: unacceptable from address: \"' + from + '\"');
		return;
	}

	list[to].handle.info (user, msg.info_id, msg.info);
};

module.exports = res;