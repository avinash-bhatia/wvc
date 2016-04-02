define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var log         = require('log')('content', 'info');
	var framework   = require('framework');
	var player      = require('./player');
	var library     = require('./library');
	var upload      = require('./upload');

	var content = {};
	var f_handle = framework.handle ('content');

	content.init = function (display_spec, custom, perms) {
		var _d = $.Deferred();

		if (!library.init (display_spec, custom, perms, f_handle)) {
			_d.reject ('content library init failed');
			return _d.promise ();
		}

		if (!upload.init (display_spec, custom, perms, f_handle)) {
			_d.reject ('content upload init failed');
			return _d.promise ();
		}

		if (!player.init (display_spec, custom, perms, f_handle)) {
			_d.reject ('content player init failed');
			return _d.promise ();
		}

		_d.resolve();
		return _d.promise();
	};

	content.info = function (from, info_id, info, _instance) {

		switch (info_id) {
			case 'new-content' :
				info.remote_slave = true;
				info.show_menu = false;
				info.shared = false;
				return handle_remote_new_content (info);

			case 'navigate-to' :
				return handle_remote_page_navigation (info);

			case 'scroll-to' :
				return handle_remote_page_scroll (info);

			default :
				log.error ('received unknown info_id (' + info_id + '). Ignoring.');
				return;
		}
	};

	content.start = function (sess_info) {
		log.info ('sess_info = ', sess_info);

		for (var uuid in sess_info.shared) {
			var i_am = f_handle.identity.vc_id;
			var remote_slave = sess_info.shared[uuid].owner === i_am ? false : true;

			/*
			 * If this content was originally shared by me, then create a library 'behind'
			 * the content first */
			if (!remote_slave) {
				content.create({
					uuid : uuid,
					remote_slave : remote_slave,
					startup : true
				});

				f_handle.tabs.sync_remote ({ uuid : uuid });
			}

			handle_remote_new_content ({
				uuid : uuid,
				content_uri : sess_info.shared[uuid].content_uri,
				remote_slave : remote_slave,
				show_menu : remote_slave ? false : true,
				shared : remote_slave ? false : true,
				page : sess_info.shared[uuid].page,
				startup : true
			});
		}

		return;
	};

	content.create = function (_options) {
		var options = _options || {};

		var handle = f_handle.tabs.create (options);

		return library.start (handle);
	};

	content.destroy = function ($tab_anchor, uuid) {
		log.info ('content.destroy: $tab_anchor', $tab_anchor, 'uuid = ' + uuid);
		player.destroy ($tab_anchor);
		library.destroy ($tab_anchor);
	};

	function handle_remote_new_content (info) {
		var options = {
			uuid : info.uuid,
			remote_slave : info.remote_slave,
			startup : info.startup || false
		};

		var handle = f_handle.tabs.get_by_uuid (info.uuid);
		if (!handle)
			handle = f_handle.tabs.create (options);

		/* reusing the options variable ... */
		options = {
			shared : info.shared,
			show_menu : info.show_menu,
			mode : 'fullview',
			page : info.page || 1
		};

		player.start (handle.anchor, info.content_uri, options);
	}

	function handle_remote_page_navigation (info) {

		var handle = f_handle.tabs.get_by_uuid (info.uuid);
		if (!handle) {
			log.error ('rx remote navigation for non-existent tab : uuid = ' + info.uuid);
			return;
		}

		player.navigate (handle.anchor, info);
	}

	function handle_remote_page_scroll (info) {

		var handle = f_handle.tabs.get_by_uuid (info.uuid);
		if (!handle) {
			log.error ('rx remote scroll for non-existent tab : uuid = ' + info.uuid);
			return;
		}

		player.scroll_to (handle.anchor, info);
	}

	return content;

});
