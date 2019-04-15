const express = require('express')
const router = express.Router()
const decryptMeter = require('../decrypt/kamstrup').decryptMeter

router.post('/', (req, res) => {
	let data = req.body.data
	let flag = req.body.flag
	console.log(data, flag)
	if (flag === 1) {
		let decrypted = decryptMeter(data)
		if(decrypted){
			res.status(200).json(decrypted)
		}
		else {
			res.status(400);
		}
	}
});

module.exports = router
