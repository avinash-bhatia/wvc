var encryption     = require ( 'auth/common/encryption' );
var log            = require ( 'auth/common/log' ).child({ 'sub-module' : 'auth/encode' } );

var exports = module.exports = {};

function get_user_details ( User, auth_via )
{
	identity.vc_auth_ts     = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	identity.auth_via       = auth_via;
	identity.id             = User.id || null;
	identity.displayName    = User.displayName || null;
	identity.name           = User.name || null;
	identity.nickname       = User.nickname || null;
	identity.birthday       = User.birthday || null;
	identity.anniversary    = User.anniversary || null;
	identity.gender         = User.gender || null;
	identity.utcOffset      = new Date().getTimezoneOffset();
	identity.emails         = User.emails || null;
	identity.photos         = User.photos || null;
	identity.addresses      = User.addresses || null;
	identity.phoneNumbers   = User.phoneNumbers || null;

	/* set primary attribute , if not set already */
	setPrimaryAttribute(identity.emails);
	setPrimaryAttribute(identity.photos);
	setPrimaryAttribute(identity.addresses);
	setPrimaryAttribute(identity.phoneNumbers);
    
	/* encrypt identity and return */
	var MAX_SIZE_COOKIE = 4096;
	var auth_string = JSON.stringify ( identity );
	if( Buffer.byteLength( auth_string ) > MAX_SIZE_COOKIE ){
		auth_string = "error: size_limit_exceeded";
	}
	log.info( {Info : auth_string},'Auth identity module');
	/* encrypt user_info */
	auth_string = encryption.encrypt ( log, auth_string );

	return auth_string;
}

/* explicitly setting primary attribute for composite array type values
 * setting only the first entry as the primary one */
function setPrimaryAttribute ( variable )
{
	if( variable === null )
		return;

	if( variable.length >= 1 )
		{
			for(var i = 0; i < variable.length; i++)
			{
				/* only if primary parameter is not present, set it as true for first array entry */ 
				if ( i === 0 )
					{
						if ( !variable[i].primary )
							variable[i].primary = true;
					}
					else variable[i].primary = false;

			} 
		}

}

/*
 * The identity is based (partially) off the specifications here:
 * Portable Contacts 1.0 Draft C
 * http://portablecontacts.net/draft-spec.html#schema
 */
var identity = {
	vc_id       : '--none-yet--',                   /* Assigned by the session controller */
	vc_auth_ts  : '--none-yet--',
	auth_via    : '--none-yet--',
	id          : '--random-default-id',
	displayName : 'buddha is smiling',
	name        : '--none-yet--',
	nickname    : '--none-yet--',
	birthday    : '--none-yet--',
	anniversary : '--none-yet--',
	gender      : '--none-yet--',
	utcOffset   : '--none-yet--',
	emails      : [
		{
			value   : '--random@email.com--',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	phoneNumbers: [
		{
			value   : '--none-yet',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	photos      : [
		{
			value   : '--none-yet',
			type    : '--none-yet',    /* work, home or other */
			primary : true
		},
	],
	addresses   : [
		{
			formatted     : '--none-yet',
			streetAddress : '--none-yet',
			locality      : '--none-yet',
			region        : '--none-yet',
			postalCode    : '--none-yet',
			country       : '--none-yet',
		},
	],

};

exports.get_user_details = get_user_details;

