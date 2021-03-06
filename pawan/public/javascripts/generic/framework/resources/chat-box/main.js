requirejs.config({  								//never ever do that again
	baseUrl: '/javascripts/generic/framework/',
	paths: {
		/*
		 * remove this hardcoded server url somehow
		 * avinash did this..just see how
		 */
		socketio: 'http://localhost:5000/socket.io/socket.io',
	}
});
/*
 * DONOT commit this file as is!
 * Don't replace the file in '/common'
 */
define(function(require){
	var $ = require('jquery');
	var log = require('log')('chat-test', 'info');
	var framework = require('framework');
	var io = require('socketio');

	var chat_box = {};
//	var anchor = {};
	var f_handle = framework.handle('chat-box');	
	var my_info = {};
	var $messages = {};
	/*
	 * create connection
	 * join room
	 * and do your stuff
	 */

		
	chat_box.init = function ( display_spec, custom, perms) {
			var _d = $.Deferred();

			log.info ('chat_box init called');

			var anchor = display_spec.anchor;
			var template = f_handle.template('chat-v1');//chat-v1 : get from display_spec itself..purpose is lost if we hardcode it
			msgTemplate = f_handle.template('message');
			if(!template) {
				_d.reject ('chat-box: template not found' );
			}
			var $room = template(
							{
								name : 'class1', 
								slug : 'chemistry'	
							});	
			$(anchor).append( $room);
			$('.lcb-entry-button').on('click', sendMessage);
			$('.lcb-entry-input').on('keypress',sendMessage);
			
			_d.resolve();

			return _d.promise();
	};
	chat_box.start = function (sess_info) {
		log.info ('chat box Stuff = ', sess_info);
		my_info = sess_info;
		
		/*  token, to be used as auth-token when communicating 	*/
		my_token = sess_info.token;
		log.info( my_token );
		
		handle_connection(sess_info);

	};
	function sendMessage(e){
		if(e.type === 'keypress' && e.keyCode !== 13 || e.altKey)
			return;
		if(e.type === 'keypress' && e.keyCode === 13 && e.shiftKey)
			return;
		e.preventDefault();
		/*
		 * if connected */
		var $textarea = $('.lcb-entry-input');
		if(!$textarea.val())
			return;

		send_message( $textarea.val() );		
		$textarea.val('');
	}
	function scrollMessages(){
		$messages[0].scrollTop = $messages[0].scrollHeight;
	}
	function handle_connection( sess_info ){
		log.info('logging','in');
		socket = io.connect(		
				sess_info.root_url,
				{ 
					query : 'token=' + my_token
				});
	
		log.info('socket is : ', socket);		
	
		socket.on('connect', function(){
			log.info('connect','done');	
			room_id = sess_info.room_id;			//there goes another global var
			join_room(room_id);
		});
		socket.on('messages:new', function(data){ log.info('received message:', data);  append_message(data)});
	}
	function join_room( room_id ){
		log.info('connecting to', room_id);
		//check if soket is null
		socket.emit('rooms:join', { roomId : room_id, password : ''}, function(resRoom){
			room = resRoom; 	// see it's global
			log.info('connected ', room);
			/* here we get the actual data about room */
			/* addTemplate(); */
			get_messages(room_id);
		});
	}
	function get_messages( room_id ){
		socket.emit('messages:list',{
			room 		: room_id,
			//since_id 	: 1,
			take		: 10,
			expand		: 'owner, room',
			reverse		: true			//what does this mean
		},function( messages){
			log.info('received_messsages', messages);
			/* append the chat retrieved (the chat before user joined the room ) 	*/
		});
	}
	function send_message( message ){
		socket.emit( 'messages:create',{ 'room' : my_info.room_id, 'text' :  message });
	}

	function append_message( json_response ){
		var sender_name = json_response.owner.displayName;
		var message 	= json_response.text;
		/*
		 * add a message template for each new message
		 * basically as 'li' 
		 */
		var $message = msgTemplate( json_response.owner);
//		$message.find('.lcb-message-text').html( message);

		$messages = $('.lcb-messages');
		$messages.append('<li>' + $message);
		$('.lcb-message-text:last').html(message);
		scrollMessages();
	}
		
	log.info ('notify_box loaded');

	return chat_box;
});
