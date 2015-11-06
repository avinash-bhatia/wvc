var url             = require('url');
var log             = require("../common/log");
var events          = require('./events')('connection');
var cc              = require('./cc');

var sock_id = 1;
var list = {};

function set_user (user) {
	var conn_id = this.c.id;

	if (!list[conn_id]) {
		log.error ('connection:set_user: unknown conn_id = ' + conn_id);
		return false;
	}

	this.c.user = user;
	return true;
}

function close () {
	log.debug ('connection: closed: removing connection # ' + this.c.id);
	events.emit ('closed', this.c.user);
	delete list[this.c.id];
}

function show_conn (c, comment) {
	if (!c)
		c = this.c;

	if (comment)
		comment = ' (' + comment +') ';

	log.debug ('connection' + comment + '# ' + c.id + '/' + (c.state ? c.state : '-') + ' ' + c.addr + ':' + c.port + ' (user: ' + (c.user ? c.user : '-') + ')');
}

function send_info (from, to, info_id, info) {
	cc.send_info (this.c.sock, from, to, info_id, info);
}

var connection = {};

var msg_route;
connection.init = function () {
	/*
	 * A hack to resolve the circular dependencies. TODO: clean
	 * this up. */
	msg_route = require ('./msg-route');
};

connection.route_req = function (sock, from, to, msg) {
	return msg_route.route_req (sock.conn_handle, from, to, msg);
};

connection.route_info = function (sock, from, to, msg) {
	/*
	 * A hack to resolve the circular dependencies. TODO: clean
	 * this up. */
	return msg_route.route_info (sock.conn_handle, from, to, msg);
};

connection.events = events;
connection.close  = function (sock) {
	var conn_handle = sock.conn_handle;
	conn_handle.close ();
};

connection.new_connection = function (sock) {

	var location = url.parse (sock.upgradeReq.url, true);
	var c = {
		id       : sock_id++,
		sock     : sock,
		location : location.path,
		addr     : sock.upgradeReq.connection.remoteAddress,
		port     : sock.upgradeReq.connection.remotePort,
		state    : 'connected'
	};

	show_conn(c, 'new');

	if (list[c.id])
		log.error ('connection:new: possibly over-writing connection info: id = ' + c.id);

	list[c.id] = c;

	var handle =  {
		c         : c,
		send_info : send_info,
		show_conn : show_conn,
		set_user  : set_user,
		close     : close
	};

	sock.conn_handle = handle;

	return handle;
};

module.exports = connection;