var router=require('express').Router()
var config=require('./config')
var apiTools=require('./apiTools')
var upload  = require('multer')()  // config settings here
var _ = require('lodash')
var doxiCache = require('memory-cache')
var md5 = require('md5')

router.get('/doxi',function (req,res,next) {  // doxi = document expiring id - provides ephemeral access to doc without needing to include credentials in visible URLs or hyperlink jumps
  if (req.headers['x-auth']) {
    var doxi=md5(JSON.stringify(req.query)+(new Date()).getTime())  // include getTime to make sure it isn't re-used
    req.query.token=req.headers['x-auth']
    doxiCache.put(doxi,req.query,10000)  // Drop from cache after 10 seconds - download request must arrive in that time
    res.send(doxi)
  } else {
    res.sendStatus(401)
  }
  })
  
router.get('/download',function (req,res,next) {
  if (req.query.doxi) {
    var cachedReq=doxiCache.get(req.query.doxi)
    if (!cachedReq) {return res.sendStatus(401)}  // Not in cache
    req.query=_.clone(cachedReq)  // replace query with copy of the cached query (which stays unaltered in the cache until timeout)
    }
  if (req.query.token) { // Either in the cached request or explicit in the current request
    req.headers['x-auth']=req.query.token 
    delete req.query.token
    }
  apiTools.IQXCall('get','IQXService/FileDownload',req.query,req,res,{},false) 
  .then(function(response) {
    res.set('content-type',response.headers['content-type'])
    res.set('content-disposition',response.headers['content-disposition'])
    res.send(response.body)
    })
  })

router.post('/upload',upload.single('file'),function (req,res,next) {
  // We receive this as a multi part request which is parsed with Multer
  // We send it on as a single part binary request with the parameters in the query string
  if (req.file.size > 2500000) {  // 2.5mb
    return res.send(apiTools.IQXFailure('File too large'))
    }
  var sQuery='?origFileName='+encodeURIComponent(req.file.originalname)
  _.each(req.body, function(val,key) {
    sQuery=sQuery+'&'+key+'='+encodeURIComponent(val)
    })

  apiTools.IQXCall('post', 'IQXService/FileUpload'+sQuery, req.file.buffer, req, res, {headers:{'content-type':'application/octet-stream'}},true) 
  .then(function(result) {
    res.send(result)
    })
  })


module.exports=router

