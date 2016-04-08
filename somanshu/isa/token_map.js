var token_map = {};

var m = {};

m.add = function (from, to, token, url) {
	token_map[from + '_' + to] = { token : token, url : url };
};

m.find = function (from, to) {
	return token_map[from + '_' + to];
};

m.remove = function (from, to) {
	delete token_map[from + '_' + to];
};

module.exports = m;
