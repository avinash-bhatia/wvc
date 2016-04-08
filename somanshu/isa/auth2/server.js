var express     = require('express');
var session     = require('express-session');
var mongoose    = require('./mongo-conn');
var body_parser = require('body-parser');
var passport    = require('passport');
var connection  = mongoose.connection;
var authorize   = require('./routes/route');

connection.once ('open', function () {
	console.log('connection OK');
	start();
});

function start() {
var port = 3000;

var app = express();

app.use(body_parser.urlencoded({
	extended : true
}));

app.use(session({
	secret : 'secret',
	saveUninitialized : true,
	resave : true
}));

app.use(passport.initialize());

app.use('/authorize', authorize);

app.listen(port);

}
