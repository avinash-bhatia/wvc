requirejs.config({

	/*
	 * Disable the load timeout */
	waitSeconds : 0,

	baseUrl: '/landing/javascripts/generic/framework/',
	paths: {
		/* the left side is the module ID,
		 * the right side is the path to
		 * the jQuery file, relative to baseUrl.
		 * Also, the path should NOT include
		 * the '.js' file extension. */
		jquery:        '/landing/javascripts/ext/jquery-1.11.3.min',
		jquery_drag:   '/landing/javascripts/ext/jquery.event.drag-2.2/jquery.event.drag-2.2',
		jquerypp:      '/landing/javascripts/ext/jquerypp.custom',
		jade:          '/landing/javascripts/ext/jade-runtime',
		modernizer:    '/landing/javascripts/ext/modernizr.custom',
		jquery_mmenu:  '/landing/javascripts/ext/jquery.mmenu.min.all',
		dom_ready:     '/landing/javascripts/ext/domReady',
		bookblock:     '/landing/javascripts/ext/jquery.bookblock',
        remodal:       '/landing/javascripts/ext/remodal.min',
		bcsocket:		'/landing/javascripts/ext/bcsocket',
		share_uncompressed:	'/landing/javascripts/ext/share_uncompressed',
		ace_share:		'/landing/javascripts/ext/ace',
	},
	'shim' : {
		'jquery_drag'     : [ 'jquery' ],
		'jquery_mmenu'    : [ 'jquery' ],
		'jquerypp'        : [ 'jquery', 'modernizer' ],
		'bookblock'       : [ 'jquerypp' ]
	}
});

define(function(require) {
	var $       = require('jquery');
	var core    = require('core');
	var blanket = require('blanket');
	var log     = require('log')('init', 'info');

	/*
	 * Initialize the Core
	 */
	core.init ()
		.then (
			function () {
				log.info ('init ok');
			},
			function (err) {
				log.error ('fatal : ' + err);
				blanket.show_error ('fatal: ' + err);
			}
		);
});
