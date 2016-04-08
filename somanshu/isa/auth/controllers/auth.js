var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var Token = require('../models/token');
var User = require('../models/user');
var Client = require('../models/client');

passport.use(new BasicStrategy(
			function(username, password, callback) {
				User.findOne({ username: username }, function (err, user) {
					if (err) { return callback(err); }

					if (!user) { return callback(null, false); }

					user.verifyPassword(password, function(err, isMatch) {
						if (err) { return callback(err); }

						if (!isMatch) { return callback(null, false); }

						//Success
						return callback(null, user);
					});
				});
			}
			));


passport.use('client-basic', new BasicStrategy(
			function(username, password, callback) {
				Client.findOne({ id: username }, function (err, client) {
					if (err) { return callback(err); }

					if (!client || client.secret !== password) { return callback(null, false); }


					return callback(null, client);

				});
			}
			));


passport.use(new BearerStrategy(
			function(accessToken, callback) {
				Token.findOne({value: accessToken }, function (err, token) {
					if (err) { return callback(err); }

					// No token found
					if (!token) { return callback(null, false); }

					User.findOne({ _id: token.userId }, function (err, user) {
						if (err) { return callback(err); }

						// No user found
						if (!user) { return callback(null, false); }

						// Simple example with no scope
						callback(null, user, { scope: '*' });
					});
				});
			}
			));

exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });

exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });

exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });

