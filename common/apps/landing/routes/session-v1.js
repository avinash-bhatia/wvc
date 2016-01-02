var express   = require('express');
var path      = require('path');
var log       = require('landing/common/log');
var session   = require('landing/controllers/session-v1');
var browser   = require('landing/lib/browser');
var auth      = require('landing/lib/auth');
var router    = express.Router();

router.use(auth.authenticate);
router.use(browser.check_compatibility);

router.get ('/:session_id/', session.load_page);
router.get ('/:session_id/load', session.load_config);

module.exports = router;

