var express         = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');
var express_winston = require('express-winston');

var config          = require('./config');
var log             = require('./common/log');
var vc_session      = require('./routes/session');

var sess = { cookie:
				{ secure: false },
				secret: '&^%Gbu45t;#tLa*',
				saveUninitialized: false,
				resave: true,
				cookie: {},
			};

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
if (app.get('env') === 'production') {
		app.set('trust proxy', true);
		sess.cookie.secure = true;
}

/* app.use(favicon(__dirname + '/public/favicon.ico')); */

var winstonStream = {
    write: function(message, encoding){
        winston.info(message);
    }
};

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sess));

app.use(express_winston.logger({
      winstonInstance : log,
      meta: false,
      msg: "HTTP {{req.ip}} {{req.method}} {{res.statusCode}} {{res.responseTime}}ms {{req.originalUrl}}",
      statusLevels : true,
      expressFormat : false,
      colorStatus : true,
      }));

app.use('/session', vc_session);

app.use(express_winston.errorLogger({
			winstonInstance : log,
			statusLevels : true,
			expressFormat : false,
			colorStatus : true,
			dumpExceptions: true,
			showStack: true
			}));

app.use(function(req, res, next) {
			var err = new Error('Not Found');
			err.status = 404;
			next(err);
			});

/*
 * Error handlers
 * --------------------
 * Development error handler - will print stacktrace
 */
if (app.get('env') === 'development') {
		app.use(function(err, req, res, next) {
						res.status(err.status || 500);
						res.render('error', {
								message: err.message,
								error: err
								});
						});
}

/*
 * Production error handler - no stacktraces leaked to user
 */
app.use(function(err, req, res, next) {
				res.status(err.status || 500);
				res.render('error', {
								message: err.message,
								error: {}
								});
				});

module.exports = app;
