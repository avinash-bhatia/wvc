var $ 			= require('jquery-deferred');
var conversion 		= require('./conversion');
var file_manager	= require('./file-management');
var queue 		= require('./queue-conversion');
var content_management 	= require('./content-management');
var log;
var coms;
var content = {};
content.init = function (myinfo, common, handles) {
	var _d = $.Deferred ();

	log = handles.log;
	coms = handles.coms;
	log.info ('Content management: init.');
	conversion.init(myinfo, log);
	content_management.init(myinfo,log);
	//file_manager.init(myinfo, log);
	_d.resolve ();
	return _d.promise ();
};

content.init_user = function (user) {
	log.info ('Content management:-> init_user'); 
	var _d = $.Deferred ();

	_d.resolve ({
		background : 'white'
	});

	return _d.promise ();
};
content.info = function (from, id, info) {
	if(id === 'content_upload'){
		log.info('Content management upload :ID--->: ',id,' Info:-> ',info.file_name,' From: ',from );
		get_presigned_url(info);
	}else if(id === 'content_conversion'){
		var queue_size = queue.size();
		if(queue_size === 0){
			send_file_to_conversion(info);
		}
		queue.add_item(info);
		log.info('CM QUEUE: ', queue.size(),'filename: ', info.file_name);
	}
	else{
		coms.broadcast_info (id, info, from);
	}
};

/* Method called from client to get the temporary url to upload file.*/
function get_presigned_url(info){
	//file_manager.get_presigned_url(info)

	content_management.get_temporaryurl(info)
	.then(
		function (result){
			coms.broadcast_info ('content_upload', result, 'arvind');
			log.info('CM GET PRESIGNED URL SUCCESS.: ', result);
		},
		function (err){
			coms.broadcast_info ('content_upload', err, 'arvind');
			log.error('CM ERROR getting pre signed url: '+err);
		}
	);
}
/* Method used to send file to box conversion*/
function send_file_to_conversion(info){
	conversion.start(info)
	.then(
		conversion_success_handler,
		conversion_failure_handler
	);
}

/***/
function conversion_success_handler(val){
	coms.broadcast_info ('content_conversion', val, 'arvind');
	// conversion process has been completed now delete raw file.
	delete_raw_file(val.file_name);
	queue.delete_item();
	log.info('CM CONVERSION COMPLETE:<++> ', val.file_name," +Q++ ",queue.size());
	if(queue.size() > 0){
		send_file_to_conversion(queue.get_item());
	}
}
/****/
function conversion_failure_handler(val){
	if(val.retry_after !== undefined ){
		setTimeout(send_file_to_conversion,val.retry_after,queue.get_item());		
		log.error('CM CONVERSION FAILURE AND RETRY: ');
	}else{
		coms.broadcast_info ('content_upload', val, 'arvind');
		log.error('CM CONVERSION FAILURE :'+val);
	}

}

/*
 *	Method called to remove raw file from temporary storage.
 */
function delete_raw_file(file_name){
	file_manager.delete_object(file_name)
	.then(
		function (data){ 
			log.info('Raw file has been removed successfully');
		},
		function(data){
			log.error('Error while removing raw file from temporary storage.');
		}
	);
}
module.exports = content;
