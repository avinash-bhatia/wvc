define(function(require) {
	var $           = require('jquery');
	var events      = require('events');
	window.jade     = require('jade');
	var log         = require('log')('library', 'info');
	var upload      = require('./upload');
	var player      = require('./player');

	var library = {};
	var f_handle_cached;
	var viewer_list = {};

	events.bind ('content:upload', handle_new_content, 'library');

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
		 * Get my identity.
		 * If this is an anonymous login, set a public account. Else ... */
		log.info ('identity - ', f_handle_cached.identity);
		var emails = f_handle_cached.identity.emails;
		var email = emails ? emails[0].value : 'test@wiziq.com';
		/*
		 * A hack - clean this later */
		if (email === '-----')
			email = 'test@wiziq.com';

		/*
		 * Load the library template */

		var template = f_handle_cached.template('library');
		var content_area_id = make_content_area_id (anchor_id);
		$(anchor).append (template ({ 
			tab_anchor_id : anchor_id,
			email : email
		}));

		upload.prepare ({
			anchor : $(anchor).find('.content-lib-upload'),
			tab_anchor : anchor,
			email : email
		});

		populate_library (email, $(anchor).find('.content-lib-main'));

		_d.resolve ();
		return _d.promise ();
	};

	library.destroy = function ($tab_anchor) {
		$tab_anchor.empty();
	};

	function populate_library (email, $anchor_lib) {

		get_content (email)
			.then (
				__populate.bind($anchor_lib), handle_error.bind($anchor_lib)
			)
			.then(
				finish.bind($anchor_lib)
			);
	}

	function finish () {
		var $anchor_lib = this;
		$anchor_lib.find('span.busy').fadeOut();
	}
	function handle_error (err) {

		/* show in all open libraries */
		var lib_instances = $('#widget-tabs').find('.content-lib-main');
		for (var i = 0; i < lib_instances.length; i++) {
			var $anchor_lib = $(lib_instances[i]);

			$anchor_lib.find('.busy').css('display', 'none');
			$anchor_lib.find('.content-lib-error').css('display', 'inline').html(err);
		}
	}

	function get_content (email) {
		var key = 'get-content';
		var val = { user_id : email };

		return f_handle_cached.send_command (null, key, val, 0);
	}

	function __populate (content_arr) {
		var $anchor_lib = this;

		for (var i = 0; i < content_arr.data.length; i++) {
			var info = content_arr.data[i];
			add_to_lib ($anchor_lib, info);
		}
	}

	function add_to_lib ($anchor_lib, info) {
		var template = f_handle_cached.template('library-item');
		var library_item = template (info);

		/*
		 * The info must look like this:
		 *     __v: 0
		 *     _id: "56dada11117a43a0fda531bb"
		 *     ctime: "2016-03-05T13:07:29.821Z"
		 *     dir: "/"
		 *     name: "gpM4Y2_1457183205532_aSes_1.pdf" (MANDATORY)
		 *     owner: "arvind@authorgen.com"
		 *     size: 379345
		 *     tags: Array[1]
		 *     type: "application/pdf" (MANDATORY)
		 *     url: "https://boxcontent.s3.amazonaws.com/bad5990bee174609a36993f621e9d7ff" (MANDATORY)
		 *     thumbnail : ...
		 */

		$anchor_lib.find('.content-lib-items ul').append(library_item);
	}

	function init_handlers () {
		$('#widget-tabs').on('click', 'a.content-preview-trigger', show_preview);
	}

	function make_content_area_id (anchor_id) {
		return 'content-area-' + anchor_id	;
	}

	function show_preview (ev) {
		/* Get the parent tab */
		var $anchor_lib = $(ev.currentTarget).closest('.content-lib-main');
		var tab_anchor_id = $anchor_lib.attr('data-tab-anchor-id');
		var tab = $anchor_lib.closest('#' + tab_anchor_id)[0];

		/* Get the content url */
		var url = $(ev.currentTarget).attr('data-content-url');

		player.start (tab, url, { 
			show_menu : true,
			mode : 'preview'
	   	});
	}

	function handle_new_content (ev, data) {
		switch (ev) {

			case 'content-added' : 
				var tab    = $(data.tab);
				var url    = data.conv_url;

				/* add to all open libraries */
				var lib_instances = $('#widget-tabs').find('.content-lib-main');
				for (var i = 0; i < lib_instances.length; i++) {
					var $anchor_lib = $(lib_instances[i]);

					add_to_lib ($anchor_lib, {
						name : data.name,
						url  : data.conv_url,
						type : data.type,
						thumbnail : data.thumbnail
					});
				}

				player.start (tab, url, { 
					show_menu : true,
					show_library_icon : true,
					mode : 'preview'
				});
				break;

			default :
				log.error ('unknown event "' + ev + '". possibly a bug in the code. ignoring.');
		}
	}

	return library;

});
