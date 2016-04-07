
var express = require('express')  ,
	session	= require('controllers/session-v1')  ;

var router = express.Router()  ;

router.post		('/', session.start);
router.put		('/', session.modify);
router.delete	('/', session.kill);

module.exports = router;
