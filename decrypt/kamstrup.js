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
	return pad(4* hex.length, res.toString(2))
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
	"Info code, V1, Min flow",
	"Info code, V1, Max flow",
	'N/A',
	'N/A',
	'N/A',
	'N/A',
	'N/A',
	'N/A',
]
const readableData = (packet) => {
	let readablePacket = {
		packinfo: {
			scale: "",
			unit: "",
			log: "",
			packageType: "",
		},
		timeInfo: {
			timeBurst: "",
			timeLeak: "",
			timeReverse: "",
			timeDry: "",
			burst: "",
			leak: "",
			reverse: "",
			dry: "",
		}

	}
	// let binPacket = hex2bin(packet)
	// console.log(binPacket
	// console.log(packet)
	//Package INFO
	// console.log(hex2bin(packet.substr(0,2)))
	let packID = hex2bin(packet.substr(0, 2))
	// console.log(packID)
	readablePacket.packinfo.scale = scales[bin2int(packID.substr(0, 2))]
	packID = packID.substr(2, packID.length)
	readablePacket.packinfo.unit = units[bin2int(packID.substr(0, 2))]
	packID = packID.substr(2, packID.length)
	readablePacket.packinfo.log = logs[bin2int(packID.substr(0, 1))]
	packID = packID.substr(1, packID.length)
	readablePacket.packinfo.packageType = packageTypes[bin2int(packID.substr(0, 3))]
	// console.log(packID.substr(0, 3))
	// binPacket = binPacket.substr(16, binPacket.length)
	// console.log(binPacket)
	// console.log(readablePacket.packinfo)
	//END
	
	//Info Codes
	// console.log(packet.substr(8, 8))
	let infoCodes = hex2bin(packet.substr(4, 4))
	// console.log(infoCodes)
	// console.log(packet.substr(4, 4))
	// console.log(infoCodes)
	readablePacket.timeInfo.timeBurst = bin2int(infoCodes.substr(0, 3))
	infoCodes = infoCodes.substr(3, infoCodes.length)
	// console.log(infoCodes)
	readablePacket.timeInfo.timeLeak = bin2int(infoCodes.substr(0, 3))
	infoCodes = infoCodes.substr(3, infoCodes.length)
	// console.log(infoCodes)
	readablePacket.timeInfo.timeReverse = bin2int(infoCodes.substr(0, 3))
	infoCodes = infoCodes.substr(3, infoCodes.length)
	// console.log(infoCodes)
	readablePacket.timeInfo.timeDry = bin2int(infoCodes.substr(0, 3))
	infoCodes = infoCodes.substr(3, infoCodes.length)
	// console.log(infoCodes)
	readablePacket.timeInfo.burst = bin2int(infoCodes.substr(0, 1))
	infoCodes = infoCodes.substr(1, infoCodes.length)
	// console.log(infoCodes)
	readablePacket.timeInfo.leak = bin2int(infoCodes.substr(0, 1))
	infoCodes = infoCodes.substr(1, infoCodes.length)
	// console.log(infoCodes)
	readablePacket.timeInfo.reverse = bin2int(infoCodes.substr(0, 1))
	infoCodes = infoCodes.substr(1, infoCodes.length)
	// console.log(infoCodes)
	readablePacket.timeInfo.dry = bin2int(infoCodes.substr(0, 1))
	infoCodes = infoCodes.substr(1, infoCodes.length)
	// console.log(readablePacket.timeInfo)
	//END
	//V1
	// binPacket = binPacket.substr(8*4, binPacket.length)
	// binPacket = binPacket.substr()
	// console.log(binPacket)
	//END
	//
	//Min/Max Flow
	// console.log(packet.substr(8,8))

	let v1Values = packet.substr(8,8)
	// console.log(v1Values === '02000000')
	// console.log(hex2bin(v1Values))

	// let v1Values = hex2bin(packet.substr(8, 2),true)
	// v1Values = v1Values.split('').reverse().join('')
	// console.log(parseInt(v1Values, 10))
	v1Values = hex2bin(reverseHex(v1Values))
	// console.log(bin2int(v1Values))
	let value = bin2int(v1Values)
	// console.log(value)

	let flow = packet.substr(16, 4)
	flow = flow.substr(2,2)+flow.substr(0,2)
	flow= hex2bin(flow)
	// console.log(flow)
	// console.log(flow, packet.substr(16, 4))
	flow = bin2int(flow)
	// console.log(value)
	// console.log(value * readablePacket.packinfo.scale)
	readablePacket.rawFlow = flow
	readablePacket.flow = flow * readablePacket.packinfo.scale
	readablePacket.value = value * readablePacket.packinfo.scale
	readablePacket.rawValue = value
	// console.log(readablePacket)
	return readablePacket 
}
const compareCRC = (crc, bits) => {
	// console.log(crc.toString(16))
	let ncrc = null
	if(crc.length !== 4){
		// console.log(crc.length)
		ncrc = '0' + crc
		ncrc = ncrc.substr(2, 4) + ncrc.substr(0, 2)
		// console.log(ncrc)

	}
	else {
		ncrc = crc
		ncrc = ncrc.substr(2, 4) + ncrc.substr(0, 2)
		
	}
	// console.log(ncrc, bits, ncrc.toString(16) === bits)
	if (ncrc === bits) {
		return true
	}
	else {
		return false
	}
}
const decryptMeter = (data, k) => {
	let packet = new Buffer.alloc(12, data, 'hex')
	console.log(packet)
	let key = new Buffer.alloc(16,k, 'hex')
	console.log(key)
	let iv = new Buffer.alloc(16, packet.slice(1, 2), 'hex')
	console.log(iv)
	let decipher = crypto.createDecipheriv('aes-128-ctr', key, iv)
	let decrypted = decipher.update(packet.slice(2, packet.length))
	console.log(decrypted)
	// console.log(packet.slice(0, 2).toString('hex') + decrypted.toString('hex'))
	let bits = decrypted.slice(0, 8) //we need only bits 3-10
	let vBits = decrypted.slice(8, 10) //last 2 bits
	// console.log(vBits)
	// console.log(bits.toString('hex'))
	// console.log(bits, crc(bits).toString(2))

	// let last2 = new Int8Array(toArrayBuffer(decrypted))
	// console.log(last2)
	// console.log(last2[8].toString(16))
	if (compareCRC(crc(bits).toString(16), vBits.toString('hex'))) {
		// console.log(decrypted)
		readableData(packet.slice(0, 2).toString('hex') + decrypted.toString('hex'))
		// return JSON.stringify({ data: packet.slice(0, 2).toString('hex') + decrypted.toString('hex') })
		return JSON.stringify(readableData(packet.slice(0, 2).toString('hex') + decrypted.toString('hex')))
	}
	else {
		return null
	}
	// return {decrypted, crc: crc(bits).toString(16), vBits: vBits.toString('hex')}
}
// console.log(decryptMeter('c3017371cf338a6627f6e327', 'A42F0A5D5EAE79BC3D474808E7D4CAEA'))
// console.log(decryptMeter('8aabcc68b5490300fbaeb195', '0B14D7B30B83D4456EFA0E10441DF3F9'))
module.exports = { decryptMeter }