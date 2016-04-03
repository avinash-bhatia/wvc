define(function(require) {
	var $           = require('jquery');
	window.jade     = require('jade');
	var modernizer  = require('modernizer');
	var log         = require('log')('tabs-v1', 'info');
	var framework   = require('framework');
	var bootstrap   = require('bootstrap');

	var tabs = {};
	var f_handle = framework.handle ('tabs-v1');
	var anchor, dropdown_menu, ul_top, content_top;
	var li_template, tabpanel_template;
	var apps = {};

	tabs.init = function (display_spec, custom, perms) {
		var _d = $.Deferred();

		anchor = display_spec.anchor;
		var template = f_handle.template("tabs");
		li_template = f_handle.template("tabs-li");
		tabpanel_template = f_handle.template("tabs-tabpanel");

		if (!template || !li_template || !tabpanel_template) {
			_d.reject ('tabs-v1: one or more templates not found');
			return _d.promise ();
		}

		$(anchor).append (template ());
		dropdown_menu = $(anchor).find('ul.dropdown-menu');
		ul_top        = $(anchor).find('ul.nav.nav-tabs');
		content_top   = $(anchor).find('div.tab-content');

		init_handlers ();

		_d.resolve();
		return _d.promise();
	};

	/*
	 * Any resource, acting as a 'tab-contrller', must provide this
	 * method to the framework, so that other users of the tabs
	 * can register themselves to this resource. */
	tabs.register = function (mod_name, mod_resource, methods) {

		apps[mod_name] = {
			methods : methods,
			resource : mod_resource
		};

		/* Add the module in the dropdown menu */
		add_to_dropdown_menu (mod_name, mod_resource);

		return null;
	};

	tabs.start = function (sess_info) {
	};

	var id_seed = 0;
	tabs.create = function (module_name, options) {
		var id = module_name + id_seed;
		var display_name = (options.display_name ? options.display_name : module_name + '(' + id_seed + ')');

		id_seed++;

		/*
		 * Create the li element and if this is supposed to be an active tab, 
		 * remove the active class from the existing ones */
		if (options.active) {
			ul_top.find('li.active').removeClass('active');
			content_top.find('div.active').removeClass('active');
		}

		ul_top.append (li_template({
			id : id,
			display_name : display_name,
			uuid : options.uuid,
			disable_close : (options.remote_slave ? true : false),
			module_name : module_name,
			active : options.active
		}));

		/*
		 * Create the tab element */
		content_top.append (tabpanel_template({
			id : id,
			uuid : options.uuid,
			active : options.active
		}));

		var res = {
			anchor    : content_top.find('div.tab-pane#' + id)[0],
			id        : id,
			uuid      : options.uuid
		};

		ul_top.find('li a#' + id).tab('show');

		return res;
	};

	tabs.destroy = function (options) {
		var uuid = options.uuid;

		destroy_tab (uuid);
	};

	tabs.sync_remote = function (options) {
		var uuid = options.uuid;

		var li = ul_top.find('li[data-tab-uuid=' + uuid + ']');
		li.addClass('tab-is-shared');
	};

	tabs.set_tooltip = function (res, options) {
		if (!options.html)
			return false;

		var uuid = res.handle.uuid;
		var li   = ul_top.find ('li[data-tab-uuid="' + uuid + '"]');
		var div  = li.find ('div.tooltip-content');

		div.append (options.html);
		div.addClass ('active');
	};

	tabs.show = function (options) {
		var uuid = options.uuid;

		ul_top.find('li[data-tab-uuid=' + uuid + '] a[data-toggle="tab"]').trigger('click');
	};

	function init_handlers () {

		/*
		 * Menu for new tab handler */
		dropdown_menu.on('click', 'a.tab-menu', function (ev) {
			var target = $(ev.currentTarget).attr('href');
			var mod_name = target.replace(/^#tab-menu-/g, '');

			if (apps[mod_name] && apps[mod_name].methods)
				apps[mod_name].methods.create();
		});

		/*
		 * Tab close handler */
		ul_top.on('click', 'span.fa.fa-times-circle', function (ev) {
			var li = $(ev.currentTarget).closest ('li');
			var uuid = li.attr('data-tab-uuid');

			destroy_tab (uuid);
			return true;
		});

		/*
		 * Handle tab shown */
		ul_top.on('shown.bs.tab', 'a[data-toggle="tab"]', function (ev) {
			var uuid = $(ev.target).closest('li').attr('data-tab-uuid');
			/*
			 * Inform the framework */
			f_handle.tabs.now_showing ({ uuid : uuid });
		});
	}

	function destroy_tab (uuid) {
		var li       = ul_top.find('li[data-tab-uuid=' + uuid + ']');

		if (!li || !li.length) {
			log.error ('destroy_tab: no link for uuid: ' + uuid);
			return;
		}

		var mod_name = li.attr('data-mod-name');
		var tab_id   = li.find('a.tab-name').attr('aria-controls');

		var $anchor = content_top.find('div#' + tab_id + '.tab-pane');

		/*
		 * Mark another tab active since this will be closed */
		mark_active_next (li);
		li.remove();

		/*
		 * For some reason, this only works if a sufficient timeout if 
		 * provided. It doesn't seem to work on smaller timeouts as well.
		 * I am not sure what the reason is, at this time. */
		setTimeout (function () {

			/*
			 * Call module specific destroy */
			if (apps[mod_name] && apps[mod_name].methods)
				apps[mod_name].methods.destroy ($anchor, uuid);

			$anchor.empty();
			$anchor.remove();

		}, 1000);

		/*
		 * Inform the framework */
		f_handle.tabs.destroyed ({ uuid : uuid });

		return;
	}

	function mark_active_next (li) {
		var next = li.next ();

		if (!next || !next.length)
			next = li.prev ();

		if (!li.hasClass('add'))
			next.find('a[data-toggle="tab"]').trigger('click');
	}

	function add_to_dropdown_menu (mod_name, mod_resource) {
		dropdown_menu.append('<li>' + 
							 	'<a class="tab-menu" href="#tab-menu-' + mod_name + '">' + mod_name + '</a>' +
							 '</li>');
	}

	return tabs;

});
