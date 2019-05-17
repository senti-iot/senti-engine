

const decryptTemperature = (packet) => {
	let readablePacket = {
		temperature: "",
		humidity: ""
	}
	readablePacket.temperature = Math.round(parseInt(packet.substr(0, 4), 16) / 10 - 40)
	readablePacket.humidity = parseInt(packet.substr(4, packet.length), 16)
	return JSON.stringify(readablePacket)
}

module.exports = { decryptTemperature }
