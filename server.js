#!/usr/bin/env nodejs
//#region Express
const dotenv = require('dotenv').load()
const express = require('express')
// import express from 'express'
const cors = require('cors')
const helmet = require('helmet')
const app = express()

const receiveData = require('./api/receiveData')

const port = process.env.NODE_PORT || 3009

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(cors())

app.use('/', receiveData)
// app.use('/', [createDT,updateDT])
// app.use('/', [createDevice, updateDevice])
// app.use('/', [createReg, updateReg])
// app.use('/', [getDeviceData])

const startAPIServer = () => {
	console.clear()	
	app.listen(port, () => {
		console.log('Senti Message Broker server started on port:', port)
	}).on('error', (err) => {
		if (err.errno === 'EADDRINUSE') {
			console.log('Server not started, port ' + port + ' is busy')
		} else {
			console.log(err)
		}
	})
}

startAPIServer()

//#endregion

// //#region MQTT 

// var StoreMqttHandler = require('./mqtt/store')
// let mqttStoreClient = new StoreMqttHandler()
// mqttStoreClient.connect()

// var StateMqttHandler = require('./mqtt/state')
// let mqttStateClient = new StateMqttHandler()
// mqttStateClient.connect()
// //#endregion