var router=require('express').Router()
var jwt=require('jwt-simple')
var config=require('./config')
var apiTools=require('./apiTools')

// The Authorisation API

router.post('/login',function (req,res,next) {
  apiTools.IQXCall('get','IQXAuthenticate',{},req,res,{username: req.body.username, password: req.body.password},true) 
  .then(function(result) {
    result.token=jwt.encode({username: req.body.username, password: req.body.password},config.secret)
    if (req.body.password == config.passwordToForceChange) {result.forceChangePassword=true}
    res.send(result)
    })
})

router.post('/changepassword',function (req,res,next) {
  var theRecord=req.body
  // First validate the request
  if (!req.headers['x-auth']) {return res.send(apiTools.IQXFailure('Not logged in'))}
  if (!(theRecord.NewPassword && theRecord.NewPassword.trim())) {return res.send(apiTools.IQXFailure('Missing password'))}
  if (theRecord.NewPassword != theRecord.RepeatPassword) {return res.send(apiTools.IQXFailure('Repeat password does not match'))}
  if (theRecord.NewPassword == config.passwordToForceChange) {return res.send(apiTools.IQXFailure('This password is not allowed'))}
  var auth=jwt.decode(req.headers['x-auth'],config.secret)
  if (theRecord.OldPassword) {
    if (theRecord.OldPassword != auth.password) {return res.send(apiTools.IQXFailure('The old password is incorrect'))}
    }
  if (theRecord.NewPassword == auth.password) {return res.send(apiTools.IQXFailure('This password is not allowed'))}
  apiTools.IQXCall('post', 'IQXChangePassword', {newpassword:theRecord.NewPassword}, req, res, {}, true) 
  .then(function(result) {
    result.token=jwt.encode({username: auth.username, password: theRecord.NewPassword},config.secret)
    res.send(result)
    })
})  

module.exports=router

