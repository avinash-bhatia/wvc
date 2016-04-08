var express = require('express');
var router  = express.Router();

var oauth2_controller = require('../controller/oauth2');
var client_controller = require('../controller/client');
var auth_controller   = require('../controller/auth');

router.post('/token', auth_controller.isClientAuthenticated, oauth2_controller.token );

router.post('/clients', client_controller.post);

module.exports = router;
