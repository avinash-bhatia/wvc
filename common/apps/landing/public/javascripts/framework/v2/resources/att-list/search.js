define( function(require){
	var $		= require('jquery');

	var search 	 = {},
		userlist = {},
		att_api  = {},
		log 	 = {},
		keys 	 = ['displayName', 'email'],
		keys_len = keys.length,
		my_namespace = '_att_skin';

	search.init = function( api, logger){
		log = logger;
		att_api = api;

		userlist = att_api.get_users(); 
		$('#atl-search input').attr("placeholder",'Search a name or an email');
		$('#atl-search input').on('keyup', keyup_handler);

	};

	search.update = function( user){
		userlist = att_api.get_users();
	};

	function keyup_handler(){
		var user;
		var val = $(this).val(); 

		Object.keys(userlist).forEach( function( key){    
			user = userlist[key];
			for( var i=0; i< keys_len; i++){
				if(~ user.identity[ keys[i]].indexOf( val)){		/* 2's complement thing */
					return _show( key, true);	
				}
			}

			/* hide the element */
			return _show( key, false);
		});
	}

	function _show( vc_id, val){
		var $elem = $('#'+vc_id + my_namespace);
		val ? $elem.show() : $elem.hide();
		return;	
	}

	return search;
});
