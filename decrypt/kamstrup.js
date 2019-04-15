// const Buffer = require('buffer').default

// const dataPacket = new Buffer.alloc(12,'C1FBF34FBB464A4D3456F747', 'hex')
// const dataPacket2 = new Buffer.alloc(12,'C1FBF34FBB464A4D3456F757', 'hex')

const key = new Buffer.from('74748073D776ECF7B6BD4AC99C18CD70', 'hex')
const crc = require('crc/lib/crc16_xmodem');
let crypto
try {
    crypto = require('crypto')
} catch (err) {
    console.log('crypto support is disabled!')
}
const compareCRC = (crc, bits) => {
	let ncrc = crc.substr(2,4) + crc.substr(0,2)
	console.log(ncrc, bits, ncrc === bits)
	if(ncrc === bits) {
		return true
	}
	else {
		return false
	}
}
const decryptMeter = (packet) => {
	let iv = new Buffer.alloc(16, packet.slice(1,2), 'hex')
    let decipher = crypto.createDecipheriv('aes-128-ctr', key, iv)
    let decrypted = decipher.update(packet.slice(2, packet.length))

    let bits = decrypted.slice(0,8) //we need only bits 3-10
    let vBits = decrypted.slice(8,10) //last 2 bits
    console.log(vBits)
    console.log(bits.toString('hex'))
    console.log(bits, crc(bits).toString(16))

    // let last2 = new Int8Array(toArrayBuffer(decrypted))
    // console.log(last2)
	// console.log(last2[8].toString(16))
	if(compareCRC(crc(bits).toString(16), vBits.toString('hex')))
	{
		return JSON.stringify({decrypted: decrypted.toString('hex')})
	}
	else {
		return null
	}
    // return {decrypted, crc: crc(bits).toString(16), vBits: vBits.toString('hex')}
}
// console.log(decryptMeter(dataPacket2))
module.exports = { decryptMeter }