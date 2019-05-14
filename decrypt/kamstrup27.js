const dotenv = require('dotenv').load();
const crc = require('crc/lib/crc16_xmodem');
// let key = new Buffer.from(process.env.MULTICAL, 'hex');
let crypto
try {
	crypto = require('crypto')
} catch (err) {
	console.log('crypto support is disabled!')
}
const reverseHex = (hex) => {
	let nHex = hex.match(/.{1,2}/g);
	// console.log(nHex)
	nHex = nHex.reverse().join('')
	// console.log(nHex)
	return nHex
}
function pad(size, string) {
	var sign = Math.sign(string) === -1 ? '-' : '';
	return sign + new Array(size).concat([Math.abs(string)]).join('0').slice(-size);
}
function hex2bin(hex, noPad) {
	let res = parseInt(hex, 16);
	// return res.toString(2)
	return pad(4 * hex.length, res.toString(2))
}
function bin2int(bin) {
	return (parseInt(bin, 2))
}
const scales = [
	null,
	"0.1",
	"0.01",
	"0.001"
]
const units = [
	"m3 & L/hr",
	"ft3 & GPM",
	"Gal & GPM",
	"N/A"
]
const logs = [
	"day",
	"hour"
]
const packageTypes = [
	{name: "Info code, V1, Min flow", id: 0},
	{name: "Info code, V1, Max flow", id: 1},
	{name: 'N/A', id: 2},
	{name: 'N/A', id: 3},
	{name: 'N/A', id: 4},
	{name: 'N/A', id: 5},
	{name: 'N/A', id: 6},
	{name: 'N/A', id: 7},
]
const infoCodes = (packet) => {
	let timeInfo = {
		timeBurst: "",
		timeLeak: "",
		timeReverse: "",
		timeDry: "",
		burst: "",
		leak: "",
		reverse: "",
		dry: "",
	}

	let infoCodes = hex2bin(packet.substr(4, 4))
	timeInfo.timeBurst = bin2int(infoCodes.substr(0, 3))
	infoCodes = infoCodes.substr(3, infoCodes.length)
	timeInfo.timeLeak = bin2int(infoCodes.substr(0, 3))
	infoCodes = infoCodes.substr(3, infoCodes.length)
	timeInfo.timeReverse = bin2int(infoCodes.substr(0, 3))
	infoCodes = infoCodes.substr(3, infoCodes.length)
	timeInfo.timeDry = bin2int(infoCodes.substr(0, 3))
	infoCodes = infoCodes.substr(3, infoCodes.length)
	timeInfo.burst = bin2int(infoCodes.substr(0, 1))
	infoCodes = infoCodes.substr(1, infoCodes.length)
	timeInfo.leak = bin2int(infoCodes.substr(0, 1))
	infoCodes = infoCodes.substr(1, infoCodes.length)
	timeInfo.reverse = bin2int(infoCodes.substr(0, 1))
	infoCodes = infoCodes.substr(1, infoCodes.length)
	timeInfo.dry = bin2int(infoCodes.substr(0, 1))
	infoCodes = infoCodes.substr(1, infoCodes.length)

	return timeInfo
}
const packInfo = (packet) => {
	let packinfo = {
		scale: "",
		unit: "",
		log: "",
		packageType: "",
	}
	let packID = hex2bin(packet.substr(0, 2))

	packinfo.scale = scales[bin2int(packID.substr(0, 2))]
	packID = packID.substr(2, packID.length)
	packinfo.unit = units[bin2int(packID.substr(0, 2))]
	packID = packID.substr(2, packID.length)
	packinfo.log = logs[bin2int(packID.substr(0, 1))]
	packID = packID.substr(1, packID.length)
	packinfo.packageType = packageTypes[bin2int(packID.substr(0, 3))]
	return packinfo
}
const v1values = (packet) => {
	let v1Values = packet.substr(8, 8)
	console.log(v1Values)
	v1Values = parseInt(reverseHex(v1Values),16)
	console.log(v1Values)

	// console.log(value)
	return v1Values
}
const maxFlow = (packet) => {
	// let maxFlow = null
	console.log(parseInt(reverseHex(packet),16))
	return parseInt(reverseHex(packet),16)
}
const temps = (packet) => {
	return parseInt(packet, 16)
}
const readableData = (packet) => {
	let readablePacket = {}

	readablePacket.packinfo = packInfo(packet)
	readablePacket.timeInfo = infoCodes(packet)
	readablePacket.value = v1values(packet) * readablePacket.packinfo.scale
	readablePacket.rawValue = v1values(packet)
	
	switch (readablePacket.packinfo.packageType.id) {
		case 2:
			readablePacket.maxFlow = maxFlow(packet.substr(20,4))
			readablePacket.minFlow = maxFlow(packet.substr(16,4))
		break;
		case 3:
		case 4:
			readablePacket.maxFlow = maxFlow(packet.substr(16,4))
			readablePacket.minATemp = temps(packet.substr(22,2))
			readablePacket.minWTemp = temps(packet.substr(20,2))
		case 7:
			readablePacket.minFlow= maxFlow(packet.substr(10,4))
			readablePacket.maxFlow = maxFlow(packet.substr(14,4))
			readablePacket.minWTemp = temps(packet.substr(16,2))
			readablePacket.minATemp = temps(packet.substr(18,2))
			readablePacket.maxATemp = temps(packet.substr(20,2))
			readablePacket.battery = temps(packet.substr(22,2))

		default:
		
		break;
	}

	return readablePacket
}

const staticFillter = '484B484C'

let aesSeq = (aes, seq) => {
	let endOfIv = aes + seq
	for (let index = endOfIv.length; index < 8; index++) {
		endOfIv = '0' + endOfIv
	}
	console.log(endOfIv)
	return endOfIv
}
const generateIV = (aes, seq, devId) => {
	//0000000000 7CB33F 48 4B 48 4C 00 0A 61 45
	let priv = devId + staticFillter + aesSeq(aes, seq)
	console.log(priv, priv.length)
	for (let index = priv.length; index < 32; index++) {
		priv = '0' + priv
	}
	let iv = new Buffer.alloc(16, priv, 'hex')
	// console.log(iv.toString('hex'))
	return iv
}
// console.log(generateIV())
const decryptkamstrup27 = (data, k, deviceId, seq) => {
	let packet = new Buffer.alloc(12, data, 'hex')
	// console.log(packet)
	let key = new Buffer.alloc(16, k, 'hex')
	// console.log(key)
	// let iv = new Buffer.alloc(16, packet.slice(1, 2), 'hex')
	let iv = generateIV(packet.slice(1, 2).toString('hex'), seq, deviceId)
	console.log(iv)
	let decipher = crypto.createDecipheriv('aes-128-ctr', key, iv)
	let decrypted = decipher.update(packet.slice(2, packet.length))
	console.log(packet.slice(0, 2).toString('hex') + decrypted.toString('hex'))


	return JSON.stringify(readableData(packet.slice(0, 2).toString('hex') + decrypted.toString('hex')))		
}

// {"lat": "56.0", "data": "c20113f565d1722e69a0bfe9", "long": "12.0", "rssi": "-123.00", "time": "1557371659", "type": "publish", "regID": "kamstrup-devices-591007aa", "seqnr": "154", "created": "2019-05-09 05:14", "regName": "kamstrup-devices-591007aa", "station": "2A7A", "version": "v1", "location": "europe", "serialnr": "7.72", "device_id": "7D6FF9", "customerID": "webhouse", "deviceName": "007D6FF9", "dataReceivedfrom": "backend.sigfox.com"}


module.exports = { decryptkamstrup27 }






