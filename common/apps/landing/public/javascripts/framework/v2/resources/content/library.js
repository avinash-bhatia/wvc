define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var log         = require('log')('library', 'info');
	var upload      = require('./upload');

	var library = {};
	var f_handle_cached;
	var viewer_list = {};

	library.init = function (display_spec, custom, perms, f_handle) {
		f_handle_cached = f_handle;
		init_handlers ();
		return true;
	};

	/*
	 * Called upon creation of a new tab */
	library.start = function (handle) {
		var viewer;
		var anchor = handle.anchor;
		var anchor_id = $(anchor).attr('id');
		var _d = $.Deferred ();

		/*
		 * Load the library template */

		var template = f_handle_cached.template('library');
		var content_area_id = make_content_area_id (anchor_id);
		$(anchor).append (template ({}));

		upload.start ($(anchor).find('.content-lib-upload'));

		_d.resolve ();
		return _d.promise ();
	};

	function init_handlers () {
		$('#widget-tabs').on('click', 'button.content-test-gen-url', handle_gen_url);
	}

	function make_content_area_id (anchor_id) {
		return 'content-area-' + anchor_id	;
	}

	function handle_gen_url (ev) {
		var key = 'get-tmp-url';
		var val = {
			dir       : '',
			file_name : 'abc.txt',
			file_type : 'txt',
			user_id   : 'avinash.bhatia@gmail.com'
		};

		log.info ('handle_gen_url handler');

		f_handle_cached.send_command (null, key, val, 0)
			.then(
					function () {
						log.info ('remote command "' + key + '->' + val + '" ok');
					},
					function (err) {
						log.error ('remote command "' + key +  '->' + val + '" failed: reason: ' + err);
					}
			     );
	}

	return library;

});