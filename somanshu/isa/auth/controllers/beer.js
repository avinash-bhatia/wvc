var Beer = require('../models/beer');

exports.postBeers = function(req, res) {
	// Create a new instance of the Beer model
	var beer = new Beer();

	// Set the beer properties that came from the POST data
	beer.name = req.body.name;
	beer.type = req.body.type;
	beer.quantity = req.body.quantity;
	beer.userId = req.user._id;

	// Save the beer and check for errors
	beer.save(function(err) {
		if (err)
		res.send(err);

	res.json({ message: 'Beer added to the locker!', data: beer });
	});
};

exports.getBeers = function(req, res) {
	// Use the Beer model to find all beer
	Beer.find({ userId: req.user._id }, function(err, beers) {
		if (err)
		res.send(err);

	res.json(beers);
	});
};

exports.getBeer = function(req, res) {
	Beer.find({ userId: req.user._id, _id: req.params.beer_id }, function(err, beer) {
		if (err)
		res.send(err);

	res.json(beer);
	});
};

exports.putBeer = function(req, res) {
	Beer.update({ userId: req.user._id, _id: req.params.beer_id }, { quantity: req.body.quantity }, function(err, beer) {
		if (err)
		res.send(err);

	res.json({ message: num + ' updated' });
	});
};

exports.deleteBeer = function(req, res) {
	Beer.remove({ userId: req.user._id, _id: req.params.beer_id }, function(err) {
		if (err)
		res.send(err);

	res.json({ message: 'Beer removed from the locker!' });
	});
};

exports.logout = function (req, res) {
	req.session.destroy(function (err){
		if (err)
		console.log("error : "+ err);
	console.log('success in session destroy');
	res.clearCookie('connect.sid', { path: '/' });
	res.send('removed session', 200);
	});
};
