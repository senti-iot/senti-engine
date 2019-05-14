const express = require('express')
const router = express.Router()
const decryptMeter = require('../decrypt/kamstrup').decryptMeter
const decryptTemperature = require('../decrypt/temperature').decryptTemperature

router.post('/', (req, res) => {
	let data = req.body.data
	let key = req.body.key
	let flag = req.body.flag
	let deviceId = req.body.deviceId
	let seq = req.body.seq
	console.log(data, key)
	switch (flag) {
		case 1:
			let decrypted = decryptMeter(data, key)
			if (decrypted) {
				res.status(200).json(decrypted)
			}
			else {
				res.status(400);
			}
			break;
		case 2:
			let decryptedTemp = decryptTemperature(data)
			if (decryptedTemp) {
				res.status(200).json(decryptedTemp)
			}
			else { 
				res.status(400)
			}
		case 3: 
			let decryptkamstrup27 = decryptkamstrup27(data, key, deviceId, seq)
		default:
			break;
	}

});

module.exports = router
