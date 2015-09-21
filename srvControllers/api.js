var router=require('express').Router()
var jwt=require('jwt-simple')
var _ = require('lodash')
var config=require('./config')
var apiTools=require('./apiTools')

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

router.post('/candregister',function (req,res,next) {
  var theRecord=req.body
  // First reality check the vital data
  if (!(theRecord.pEmail && theRecord.pEmail.trim())) {return res.send(apiTools.IQXFailure('Missing email address'))}
  if (theRecord.pEmail != theRecord.pRepeatEmail) {return res.send(apiTools.IQXFailure('Repeat email does not match'))}
  if (!(theRecord.pUserName && theRecord.pUserName.trim())) {return res.send(apiTools.IQXFailure('Missing user name'))}
  if (!(theRecord.pPassword && theRecord.pPassword.trim())) {return res.send(apiTools.IQXFailure('Missing password'))}
  if (theRecord.pPassword != theRecord.pRepeatPassword) {return res.send(apiTools.IQXFailure('Repeat password does not match'))}
  if (theRecord.pPassword == config.passwordToForceChange) {return res.send(apiTools.IQXFailure('This password is not allowed'))}           
  if (!(theRecord.pForenames && theRecord.pForenames.trim())) {return res.send(apiTools.IQXFailure('Missing forenames'))}
  if (!(theRecord.pSurname && theRecord.pSurname.trim())) {return res.send(apiTools.IQXFailure('Missing surname'))}
  var candPost=_.clone(theRecord)
  var userHumanName=_.words(candPost.pForenames)[0]+' '+candPost.pSurname
  var finalResult
  delete candPost.pUserName
  delete candPost.pPassword
  delete candPost.pRepeatPassword
  delete candPost.pRepeatEmail
  apiTools.IQXCall('post', 'IQXCall_/NetCandidateRegisterPreCheck', candPost, req, res, {}, true) 
  .then(function(result) {
    var regPost={userclass:'CANDIDATE',
                 name:userHumanName,
                 loginid:theRecord.pUserName,
                 password:theRecord.pPassword,
                 emailaddress:theRecord.pEmail}
    return apiTools.IQXCall('post', 'IQXRegister_', regPost, req, res, {}, true)
    })
  .then(function(result) {
    finalResult=result  // Contains the Rights and Switches
    candPost.pNewWebUserID=result.IQXResult.UserID
    return apiTools.IQXCall('post', 'IQXCall_/NetCandidateRegister', candPost, req, res, {}, true)
    })
  .then(function(result) {
    finalResult.token=jwt.encode({username: theRecord.pUserName, password: theRecord.pPassword},config.secret)
    finalResult.IQXResult.UserName=userHumanName
    finalResult.IQXResult.UserClass='CANDIDATE'
    return res.send(finalResult)  // Successful registration
    })
})

// NB The 'catch all' routes must come AFTER the explicitly named ones

router.get('/:handler/:service?',function (req,res,next) {
  apiTools.IQXCall('get','IQX'+req.params.handler+'/'+req.params.service,req.query,req,res,{},true) 
  .then(function(result) {
    res.send(result)
    })
  })

router.post('/:handler/:service?',function (req,res,next) {
  apiTools.IQXCall('post','IQX'+req.params.handler+'/'+req.params.service,req.body,req,res,{},true) 
  .then(function(result) {
    res.send(result)
    })
  })

module.exports=router

