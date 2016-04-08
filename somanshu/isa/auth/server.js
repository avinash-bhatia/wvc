var express    = require('express');
var ejs        = require('ejs');
var session    = require('express-session');
var mongoose   = require('./mongo-conn');
var bodyParser = require('body-parser');
var passport   = require('passport');
var connection = mongoose.connection;

//Connect to mongodb
connection.on ( 'error', function (err) {
	    console.log ('Connection error to mongodb');
		    process.exit (1);
});

connection.on ( 'disconnected', function () {
	    console.log ('disconnected');
});

connection.on ( 'connected', function () {
	    console.log('connected');
});

connection.once ( 'open', function () {
	    console.log('connection OK');
		start();
});

function start() {
var Beer = require('./models/beer');
var authController = require('./controllers/auth');
var beerController = require('./controllers/beer');
var userController = require('./controllers/user');
var clientController = require('./controllers/client');
var oauth2Controller = require('./controllers/oauth2');

// Create our Express application
var app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));

//app.use(bodyParser.json());

app.use(session({
	  secret: 'Super Secret Session Key',
	  saveUninitialized: true,
	  resave: true
}));

app.use(passport.initialize());

// Create our Express router
var router = express.Router();

router.route('/beers')
	.post(authController.isAuthenticated, beerController.postBeers)
	.get(authController.isAuthenticated, beerController.getBeers);

router.route('/beers/:beer_id')
	.get(authController.isAuthenticated, beerController.getBeer)
	.put(authController.isAuthenticated, beerController.putBeer)
	.delete(authController.isAuthenticated, beerController.deleteBeer);

router.route('/users')
	.post(userController.postUsers)
	.get(authController.isAuthenticated, userController.getUsers);

router.route('/clients')
	.post(authController.isAuthenticated, clientController.postClients)
	.get(authController.isAuthenticated, clientController.getClients);

router.route('/oauth2/authorize')
	.get(authController.isAuthenticated, oauth2Controller.authorization)
	.post(authController.isAuthenticated, oauth2Controller.decision);

router.route('/oauth2/token')
	.post(authController.isClientAuthenticated, oauth2Controller.token);

router.route('/logout')
	.get(beerController.logout);

// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(3000);
}
