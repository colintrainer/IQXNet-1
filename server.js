var express    = require('express')
var bodyParser = require('body-parser')
var logger     = require('morgan')
var https = require('https')
var http = require('http')
var fs = require('fs')
var config=require('./srvControllers/config')
var app = express()

app.use(bodyParser.json())
app.use(logger('dev'))
app.use(require('./srvControllers'))

var port=process.env.PORT || config.publicPort   // A separate server instance for automated testing can be ensured by setting env.PORT in the test harness
if (port) {
	var server = http.createServer(app).listen(port, function () {
		console.log('Server listening on %d', server.address().port)
		})
	}
	
var secureport=config.publicSecurePort
if (secureport && !process.env.PORT) {    // Don't start secure server if this is an automated test
	var options = {
		key: fs.readFileSync('./key.pem'),
		cert: fs.readFileSync('./cert.pem')
		}
	var secureserver = https.createServer(options, app).listen(secureport, function () {
		console.log('Secure server listening on %d', secureserver.address().port)
		})
	}
	

