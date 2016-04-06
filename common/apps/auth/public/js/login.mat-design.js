
function is_cookie_enabled () {
	var cookieEnabled=(navigator.cookieEnabled)? true : false;

	//if not IE4+ nor NS6+
	if (typeof navigator.cookieEnabled=="undefined" && !cookieEnabled){ 
		document.cookie="testcookie";
		cookieEnabled=(document.cookie.indexOf("testcookie")!=-1)? true : false;
	}

	return cookieEnabled;
}

function get_cookie ( name ) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

if ( !is_cookie_enabled() ) {
	$('#cookie-error').html('I need cookies to function properly. Enable cookies, go back and retry again.');
	$('#cookie-error').css('display', 'block');
	$('#main-title').css('display', 'none');
	$('input#user_id').prop('disabled', true);
	$('input#display_name').prop('disabled', true);
	$('button').prop('disabled', true);

	throw 'no cookies enabled';
}

var redirect_to = get_cookie('wiziq_origin');

if ( !redirect_to ) {
	$('#cookie-error').html('Can\'t seem to know where you came from. Enable your cookies, go back and try again');
	$('#cookie-error').css('display', 'block');
	$('#main-title').css('display', 'none');
	$('input#user_id').prop('disabled', true);
	$('input#display_name').prop('disabled', true);
	$('button').prop('disabled', true);

	throw 'no cookies enabled';
}

function do_it_all () {
	console.log ("do_it_all");
	$('button').on('click', function () {

		var id = $('input#user_id').val();
		var display_name = $('input#display_name').val();

		if( id === "" || display_name === "" ) {
			alert( "Enter both the fields" );         
			return false;
		}
		/* generate id via hashing taking display_name as an input */
		id = hash_code ( display_name ); 

		var identity = {
			id : id,
			displayName : display_name
		};

		/* convert identity structure to a standard format */
		var user_identity = get_user_details ( identity, 'anon' );

		var id_uriencoded = encodeURIComponent ( user_identity );

		document.cookie = "wiziq_auth=" + id_uriencoded + "; max-age=3600; path=/";

		window.location = decodeURIComponent ( redirect_to );

		return false;
	});
}


/*
 *  The identity is based (partially) off the specifications here:
 *  Portable Contacts 1.0 Draft C
 *  http://portablecontacts.net/draft-spec.html#schema
 */
var identity = {
	vc_id       : '--none-yet--',                   /* Assigned by the session controller */
	vc_auth_ts  : '--none-yet--',
	auth_via    : '--none-yet--',
	id          : '--random-default-id',
	displayName : 'buddha is smiling',
	name        : null,
	nickname    : null,
	birthday    : null,
	anniversary : null,
	gender      : null,
	utcOffset   : null,
	emails      : null,
	phoneNumbers: null,
	photos      : null,
	addresses   : null

};


function get_user_details ( User, auth_via ) {
	identity.vc_auth_ts     = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	identity.auth_via       = auth_via;
	identity.id             = User.id || null;
	identity.displayName    = User.displayName || null;
	identity.utcOffset      = new Date().getTimezoneOffset();

	/* encrypt identity and return */
	var MAX_SIZE_COOKIE = 4096;
	var auth_string = JSON.stringify ( identity );

	console.log ( " auth_string "+ auth_string);

	/* for now there is no encryption, but whenever we add encryption code
	 * we will need to encrypt the message here.
	 */ 

	return auth_string;
}

/* hashing used to create id corresponding to display name */

function hash_code ( display_name ) {

	var d = new Date().getTime();
	d += display_name;

	if (window.performance && typeof window.performance.now === "function") {
		d += performance.now(); //use high-precision timer if available
	}

	var hash = 0, i, chr, len;
	len = d.length;

	if ( len === 0 )
	   	return hash;

	for( i = 0; i < len; i++ ) {

		chr   = d.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer

	}

	console.log ('Anonymous user id: '+ hash );

	return hash;
}




$(document).ready(do_it_all);
