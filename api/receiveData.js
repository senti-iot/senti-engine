const express = require('express')
const router = express.Router()
const decryptMeter = require('../decrypt/kamstrup').decryptMeter
const decryptkamstrup27 = require('../decrypt/kamstrup27').decryptkamstrup27
const decryptTemperature = require('../decrypt/temperature').decryptTemperature

router.post('/', (req, res) => {
	let data = req.body.data
	let key = req.body.key
	let flag = req.body.flag
	let deviceId = req.body.device_id
	let seq = req.body.seq
	console.log(data, key, deviceId, seq, req.body)
	console.log(data, key)
	switch (flag) {
		case 1:
			let decrypted = decryptMeter(data, key)
			if (decrypted) {
				res.status(200).json(decrypted)
			}
			else {
				res.status(500);
			}
			break;
		case 2:
			let decryptedTemp = decryptTemperature(data)
			if (decryptedTemp) {
				res.status(200).json(decryptedTemp)
			}
			else {
				res.status(500)
			}
		case 3:
			console.log(data, key, deviceId, seq)
			let decryptKamstrup27 = decryptkamstrup27(data, key, deviceId, seq)
			if (decryptKamstrup27) {
				res.status(200).json(decryptKamstrup27)
			}
			else {
				res.status(500)
			}
		default:
			break;
	}

});

module.exports = router
