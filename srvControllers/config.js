module.exports={
  secret: 'GBR631TD69JT0189601750',      // For signing the authentication token
  iqxHubURL: 'http://localhost:54000/',  // Must have trailing slash - e.g. 'http://localhost:54000/'
  publicPort: 3000,                      // The outward facing http web server port - 0 to disable
  publicSecurePort: 0,                   // The outward facing https web server port - 0 to disable
  passwordToForceChange: 'password'      // If this password is used it will force an immediate change on login
	}
	