var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var Token = require('../models/token');
var Client = require('../models/client');


passport.use('client-basic', new BasicStrategy(
			function(username, password, callback) {
				Client.findOne({ id: username }, function (err, client) {
					if (err) { return callback(err); }

					if (!client || client.secret !== password) { return callback(null, false); }


					return callback(null, client);

				});
			}
			));


passport.use('accessToken', new BearerStrategy(
			function(accessToken, callback) {
				Token.findOne({value: accessToken }, function (err, token) {
					if (err) { return callback(err); }

					// No token found
					if (!token) { return callback(null, false); }

					Client.findOne({ _id: token.clientId }, function (err, client) {
						if (err) { return callback(err); }

						// No user found
						if (!client) { return callback(null, false); }

						// Simple example with no scope
						callback(null, client, { scope: '*' });
					});
				});
			}
			));

exports.isBearerAuthenticated = passport.authenticate('accessToken', { session: false });

exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
