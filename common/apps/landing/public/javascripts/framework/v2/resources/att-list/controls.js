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
		$('#atl-list').on('click', '.atl-control', control_clicked);
	
		_d.resolve();
		return _d.promise();
	};

	controls.change = function (vc_id, key, val) {
		state[vc_id] = state[vc_id] || {};

		switch (state[vc_id][key]) {
			case undefined:							/* initial state of the control */
				change_control (vc_id, key, val);	/* decides which icon to show (on/off) */
				change_state (vc_id, key);
				break;

			case 'set':
				change_control (vc_id, key, val);	/* seems like someone else changed the value of some control */
				break;

			case 'busy':							/* this must be the ack/nack to our req. */
				change_control (vc_id, key, val);	
				change_state (vc_id, key);
				break;		
		}
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
			ele   = $(this).attr('id'),
			key	  = ele.replace('-slashed','');
			val   = undefined;

		state[vc_id] = state[vc_id] || {};
		if( state[vc_id][key] === 'busy' || state[vc_id][key] === undefined ){
			log.info('attempted to change while in \'busy/undef\' state. Is a problem, control shouldn\'t be clickable');
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
			change_state (vc_id, key);
		}

		log.info(vc_id+ ' key: '+ key + ', to be val:'+val+', on_click');
	}
	
	function change_control( vc_id, key, val){				/* set value */
		
		if( key == 'audio-control'){
			/* vu-meter is a special case */
			var _ele = _dom.handle(vc_id, key);
			_ele.css('width', val*100 + 'px');
			return;	
		}

		/* ----------------------
		 * all others are similar
		 * ---------------------- */
		var _ele_on = _dom.handle(vc_id, key),
			_ele_off= _dom.handle(vc_id, key+'-slashed');
	
		( val) ? ( _ele_on.show().css('display','inline-block'), _ele_off.hide() )	
			   : ( _ele_off.show().css('display','inline-block'), _ele_on.hide() );
	}

	function change_state( vc_id, key, val){
		/* allowed state changes are:
		 *		1. undefined ----> set
		 *		2. set		 ----> busy
		 *		3. busy 	 ----> set */
		//handle audio -control wala case
		
		var el_on = _dom.handle( vc_id, key),
			el_off = _dom.handle( vc_id, key + '-slashed');

		switch (state[vc_id][key]) {

			case undefined:
			case 'busy':
				/* change to set */
				el_on.css('fill','green'); 
				el_off.css('fill','red'); 
				state[vc_id][key] = 'set';
				break;

			case 'set':
				/* change to busy */
				el_on.css('fill','yellow'); 
				el_off.css('fill','yellow'); 
				state[vc_id][key] = 'busy';
				break;

			default:
				log.info("element found in some unknown state");
				state[vc_id][key] = undefined;				/* what else can i do here */
		}
	}

	return controls;
});
