var jwt=require('jwt-simple')
var config=require('./config')

// This code is not currently required since the x-auth functionality is handled in apiTools.buildOptions
module.exports=function (req,res,next) {
  if (req.headers['x-auth']) {
    req.auth=jwt.decode(req.headers['x-auth'],config.secret)
    }
  next()
  }
  