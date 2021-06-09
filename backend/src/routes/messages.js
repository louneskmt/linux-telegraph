const express = require('express');
const router = express.Router();

const Message = require('src/models/Message.js');

router.get('/', (req, res) => {
	const { body } = req;
});

router.get('/latest', (req, res) => {

});

module.exports = router;