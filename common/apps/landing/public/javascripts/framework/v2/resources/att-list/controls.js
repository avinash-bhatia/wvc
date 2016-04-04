/* 
 * an 'icon' in controlsbar represents on/off state of a control(aka key) */

define( function(require){
	var $ 		= require('jquery'),
		_dom 	= require('./element');	/* provides the cached handles of elements */

	var	log 	 	 = {},
		state 	 	 = {},				/* state of each control: initially 'undefined' then either 'set' or 'busy'. */
		controls 	 = {},
		attendee_api = {},
		my_namespace = '_att_skin';

	controls.init = function( api, logger){
		var _d = $.Deferred();
		
		log = logger;
		window.att_api = api; 	/* for testing purpose */
		attendee_api = api;
		$('body').on ('click', '#atl-list .atl-control', control_clicked);
	
		_d.resolve();
		return _d.promise();
	};

	controls.change = function (vc_id, key, val) {

		if (val !== true && val !== false) {
			log.error ('controls.change: invalid value for val', val, 'expected "true" or "false"');
			return;
		}

		state[vc_id]   = state[vc_id] || {};
		var curr_state = state[vc_id][key];

		switch_control_icon (vc_id, key, val);	/* decides which icon to show (on/off) */
		change_state (vc_id, key, 'set');
		return;
	};

	controls.forget = function( vc_id){
		/* remove the things related to this user
		 * i.e. states of the controls
		 * and dom elements cache */
		state[vc_id] = undefined;
		_dom.forget(vc_id); 
	};

	/*
	 * private methods */

	function control_clicked ( evt ) {

		var id = $(this).closest('li').attr('id');
		if (!id) {
			log.info('warn:::user id not found...did someone change the user template?');
			return false; 
		}
	
		var vc_id = id.replace (my_namespace, ''),
			ele   = $(this).attr('data-id'),
			key	  = ele.replace('-slashed','');
			val   = undefined;

		state[vc_id] = state[vc_id] || {};

		if (state[vc_id][key] === 'busy' || !state[vc_id][key]) {
			log.info ('attempted to change while in \'busy/undef\' state. Is a problem, control shouldn\'t be clickable');
			return false;
		}
		
		switch (ele) {
			case 'microphone':
				val = 'false';
				break;
			case 'microphone-slashed':
				val = 'true';
				break;
			case 'camera':
				val = 'false';
				break;
			case 'camera-slashed':
				val = 'true';
				break;
			default:
				log.info( key + " clicked____and is not handled");
				return;
		}

		if (val) {
			attendee_api.set_meta (vc_id, key, val, true);			/* 'true' tells it is a request */
			change_state (vc_id, key, 'busy');
		}

		log.info (vc_id + ' key: ' + key + ', to be val:' + val + ', on_click');
	}
	
	function switch_control_icon (vc_id, key, val) {
		
		if (key == 'audio-control') {
			/* vu-meter is a special case */
			var _ele = _dom.handle(vc_id, key);
			_ele.css('width', val*100 + 'px');
			return;	
		}

		/* ----------------------
		 * all others are similar
		 * ---------------------- */
		var _ele_on = _dom.handle(vc_id, key),
			_ele_off= _dom.handle(vc_id, key + '-slashed');
	
		var to_show =  val ? _ele_on : _ele_off;
		var to_hide = !val ? _ele_on : _ele_off;

		to_show.css('display', 'inline-block');
		to_hide.css('display', 'none');
	}

	function change_state (vc_id, key, __state) {
		/* allowed state changes are:
		 *		1. undefined ----> set
		 *		2. set		 ----> busy
		 *		3. busy 	 ----> set */
		
		if (__state !== 'busy' && __state !== 'set') {
			log.error ('change_state: invalid state = ', __state);
			return;
		}

		var el_on  = _dom.handle (vc_id, key),
			el_off = _dom.handle (vc_id, key + '-slashed');

		var add_class = 'att-state-' + __state;
		var rem_class = (__state === 'busy' ? 'att-state-set' : 'att-state-busy');

		el_on.addClass (add_class);
		el_on.removeClass (rem_class);

		el_off.addClass (add_class);
		el_off.removeClass (rem_class);

		state[vc_id][key] = __state;
		return;
	}

	return controls;
});
