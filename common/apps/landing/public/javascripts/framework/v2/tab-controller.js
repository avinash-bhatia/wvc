define(function(require) {
	var $          = require('jquery');
	var log        = require('log')('tab-controller', 'info');

	var m = {};
	var controller = null;
	var f_handle_cached;
	var controller_initizlied = false;
	var pending_list = {};
	var active_list = {};

	m.init = function (sess_config, _framework) {
		f_handle_cached = _framework.handle('tab-controller');
	};

	/*
	 * This method just registers the controller */
	m.register_controller = function (_module) {
		var err = null;

		/* 
		 * Check to see if the module has all the mandatory 
		 * methods */
		err = check_controller_methods (_module);
		if (err)
			return err;

		controller = _module;
		return null;
	};

	/*
	 * Called by the framework, immediately after the successfull
	 * init of the resource acting as the tab-controller */
	m.flush_pending_registrations = function () {

		controller_initizlied = true;

		/* Register all the pending modules */
		for (var mod_name in pending_list) {

			m.register (pending_list[mod_name]);
			/*
			 * We ignore the errors - just print a message and that's that */
			active_list[mod_name] = pending_list[mod_name];
			delete pending_list[mod_name];
		}
	};

	/*
	 * This method registers the tab-user modules. Note, that this 
	 * method is not explicitly called by the module, but by the framework
	 * on behalf of the module during layout attach process, based upon the 
	 * "display_spec" declaration of the module in the class_config. It will
	 * be called before the registering module itself initializes. */
	m.register = function (_module) {

		/* 
		 * Check to see if the module has all the mandatory 
		 * methods */
		err = check_methods (_module);
		if (err)
			return err;

		/*
		 * If no controller has been registered so far, then just
		 * add it in the pending list and leave */
		if (!controller || !controller_initizlied) {
			pending_list[_module.name] = _module;
			log.info ('registeration of "' + _module.name + '" pending until a controller registers');
			return;
		}

		var methods = {
			create  : _module.handle.create,
			destroy : _module.handle.destroy,
		};
		var err = controller.handle.register (_module.name, _module.resource, methods);

		if (err)
			return err;

		active_list[_module.name] = _module;
		return null;
	};

	var session_wide_active_tab;
	m.set_active = function (sess_info) {
		session_wide_active_tab = sess_info.uuid || null;
	};

	m.info = function (from, to, info_id, info) {

		switch (info_id) {

			case 'tab-destroyed':
				controller.handle.destroy (info);
				break;

			case 'tab-now-showing':
				controller.handle.show (info);
				break;

			default :
				log.error ('unknown info_id (' + info_id + ') recieved. ignoring.');
				return;
		}
	};

	m.api = function (mod_name) {
		return {
			module_name : mod_name,
			/*
			 * Generally called by the client resources */
			create      : create,
			get_by_uuid : get_by_uuid,
			sync_remote : sync_remote,

			/*
			 * Generally called by the tab-controller resource */
			destroyed   : destroyed,
			now_showing : now_showing,

			/*
			 * implement later 
			 destroy : destroy,
			 enable : enable,
			 disable : disable,
			 save : save,
			 */
		};
	};

	var uuid_array = {};
	function get_by_uuid (uuid) {
		return uuid_array[uuid] ? uuid_array[uuid].handle : null;
	}

	function create (options) {
		var mod_name = this.module_name;
		log.info ('options create = ', options);

		if (!controller) {
			log.error ('create: no registerd controller', options);
			return;
		}

		if (!options)
			options = {};
		/*
		 * If the caller provided a uuid,then do not override */
		if (!options.uuid)
			options.uuid = uuid();

		options.active = true;
		if (options.startup) {
			if (session_wide_active_tab != options.uuid)
				options.active = false;
		}

		log.info ('options = ', options);
		var res = controller.handle.create (mod_name, options);

		/* Ensure that "res" contains the required fields */
		if ((typeof res.id === 'undefined') ||
			(typeof res.anchor === 'undefined')) {
			log.error ('create: improper return value ', res);
		}

		uuid_array [ options.uuid ] = {
			handle      : res,
			sync_remote : false
		};

		return res;
	}

	function destroyed (options) {
		var uuid = options.uuid;

		if (uuid_array[uuid]) {
			if (uuid_array[uuid].sync_remote)
				f_handle_cached.send_info ('*', 'tab-destroyed', { uuid : uuid }, 0);

			delete uuid_array[uuid];
		}
	}

	function now_showing (options) {
		var uuid = options.uuid;

		if (uuid_array[uuid]) {
			if (uuid_array[uuid].sync_remote)
				f_handle_cached.send_info ('*', 'tab-now-showing', { uuid : uuid }, 0);
		}
	}

	function sync_remote (options) {
		var uuid = options.uuid;
		var mod_name = this.module_name;

		if (!uuid) {
			log.error ('sync_remote: null uuid (' + mod_name + '). likley programmatic error.');
			return false;
		}

		if (!uuid_array[uuid]) {
			log.error ('sync_remote: no tab for uuid "' + uuid + '" (' + mod_name + '). likley programmatic error.');
			return false;
		}

		uuid_array[uuid].sync_remote = true;
		/*
		 * Just inform the tab controller resource. The actual messages for sharing 
		 * will still be handled by that module */
		controller.handle.sync_remote (options);

		now_showing ({ uuid : uuid });

	}

	function check_controller_methods (_module) {

		try {
			__check(_module.name, 'register',    _module.handle.register);
			__check(_module.name, 'create',      _module.handle.create);
			__check(_module.name, 'destroy',     _module.handle.destroy);
			__check(_module.name, 'sync_remote', _module.handle.sync_remote);
			__check(_module.name, 'show',        _module.handle.show);
		}
		catch (err) {
			log.error (err);
			return err;
		}

		return null;
	}

	function check_methods (_module) {

		try {
			__check(_module.name, 'create', _module.handle.create);
			__check(_module.name, 'destroy', _module.handle.destroy);
		}
		catch (err) {
			log.error (err);
			return err;
		}

		return null;
	}

	function __check (mod_name, method_name, method) {

		if (typeof method === 'undefined') {
			var err = 'undefined "' + method_name + '" method for "' + mod_name + '", required by tab-controller';
			throw err;
		}
	}

	function uuid () {
		var d = new Date().getTime();
		if (window.performance && typeof window.performance.now === "function") {
			d += performance.now(); //use high-precision timer if available
		}

		var _u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});

		return _u;
	}

	return m;
});

