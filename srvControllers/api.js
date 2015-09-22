var router=require('express').Router()
var apiTools=require('./apiTools')

// These are the generic api handlers

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

