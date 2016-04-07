
var express = require('express')  ,
	node	= require('controllers/node-v1')  ;

var router = express.Router()  ;

router.post		('/', node.acquire);
router.put		('/', node.update);
router.delete	('/', node.renounce);

module.exports = router;
