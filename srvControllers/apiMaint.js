var router=require('express').Router()
var jwt=require('jwt-simple')
var needle = require('needle');
var xml2js = require('xml2js')
var parser = new xml2js.Parser({trim:true,explicitArray:false,attrkey:'attrs',charkey:'message'});
var config=require('./config')
var apiTools=require('./apiTools')
var _ = require('lodash')
var fs = require('fs')
var process = require('child_process')

function xClean(s) {
  s=_.trim(s)
  s=s.replace(/["]/g, '')
  s=s.replace(/\s+/g, ' ') //All blocks of white space -> single space character
  s=s.replace(/\s\W/g, function (x){return _.trim(x)}) //Remove spaces preceding a non-word character
  s=s.replace(/\W\s/g, function (x){return _.trim(x)}) //Remove spaces following a non-word character
  s=s.replace(/^alter/i, 'create')
  return s.toLowerCase()
  }

function xDiff(s1,s2) {
  return (xClean(s1) != xClean(s2))
  }
  
function xLineCount(s){
  var lnCnt=1
  _.forEach(s,function(c) {if (c=="\n") {lnCnt++}})
  return lnCnt
  }

function procDbRow(r) {
  var s=_.trimRight(r.ProcBody)
  if (!s) {return}
  var lnCnt=xLineCount(s)
  var fn='./dbsql/'+r.ProcName+'.sql'
  fs.writeFileSync(fn,s)
  var stt=fs.statSync(fn)
  this.push({procName:r.ProcName,dbLines:lnCnt,dbStamp:stt.mtime,bDiff:true,body:s})
  }
  
function procFile(f) {
  var s=_.trimRight(fs.readFileSync('./sql/'+f))
  if (!s) {return}
  var lnCnt=xLineCount(s)
  f=f.substr(0,f.length-4)  // Lose the extension
  var i=_.findIndex(this,function(x){return x.procName.toUpperCase()==f.toUpperCase()})
  if (i>=0) {
    this[i].fileLines=lnCnt
    this[i].bDiff=xDiff(this[i].body,s)
    this[i].bBoth=true
  } else {
    this.push({procName:f,fileLines:lnCnt,bDiff:true})
  }
  }

router.get('/getDbProcs',function (req,res,next) {
  needle.get(config.iqxHubURL+'IQXcallresult/netapiprocs'+apiTools.extractQueryString(req.originalUrl), apiTools.buildOptions(req.headers), function(error, response) {
    if (error) {
        console.log(error.message)
        res.sendStatus(503)   // Service unavailable
    } else if (response.statusCode == 200) {  // Success
       parser.parseString(response.body, function (err, result) {
        if (result.IQXResult.attrs.success=='0') {
          res.send(result)
          return
        }
        var ar=[]
        try {
          fs.mkdirSync('./sql')
        } catch(err) {}
        try {
          fs.mkdirSync('./dbsql')
        } catch(err) {}
        if (result.IQXResult.Row) {
          if (_.isArray(result.IQXResult.Row)) {
            _.forEach(result.IQXResult.Row,procDbRow,ar)
          } else {
            procDbRow.call(ar,result.IQXResult.Row)
          }
        }
        var Files=fs.readdirSync('./sql')
        _.forEach(Files,function(f){
          if (_.startsWith(f.toUpperCase(),req.query.pRoot.toUpperCase()) && _.endsWith(f.toUpperCase(),'.SQL')) {
            procFile.call(ar,f)
            }
          })
        _.forEach(ar,function(r){
          r.body=undefined  // We don't want to send the proc code to the browser
          })
        res.send({IQXResult:{attrs:{success:"1"},Row:ar}})
      })
    } else {
      res.sendStatus(response.statusCode)
    }
    })
})

router.get('/getDbProc',function (req,res,next) {
  needle.get(config.iqxHubURL+'IQXcallresult/netapiproc'+apiTools.extractQueryString(req.originalUrl), apiTools.buildOptions(req.headers), function(error, response) {
    if (error) {
        console.log(error.message)
        res.sendStatus(503)   // Service unavailable
    } else if (response.statusCode == 200) {  // Success
       parser.parseString(response.body, function (err, result) {
        if (result.IQXResult.attrs.success=='0') {
          res.send(result)
          return
        }
        var s=''
        if (result.IQXResult.Row) {
          s=_.trimRight(result.IQXResult.Row.ProcBody)
        }
        if (s) {
          fs.writeFileSync('./dbsql/'+req.query.pName+'.sql',s)
        } else {
          process.execSync('del .\\dbsql\\'+req.query.pName+'.sql')
        }
        res.send({IQXResult:{attrs:{success:"1"}}})
      })
    } else {
      res.sendStatus(response.statusCode)
    }
    })
})

router.post('/editDbProc',function (req,res,next) {
  var fn=req.body.pName+'.sql'
  var tp=req.body.pType
  if (tp=='D') {
    process.exec('.\\dbsql\\'+fn)
  } else if (tp=='F') {
    process.exec('.\\sql\\'+fn)
  } else if (tp=='C') {
    process.exec('"C:\\Program Files (x86)\\Beyond Compare 2\\bc2.exe" .\\dbsql\\'+fn+' .\\sql\\'+fn)
  } 
  res.send({IQXResult:{attrs:{success:"1"}}})  
})

router.post('/copyDbProc',function (req,res,next) {
  var fn=req.body.pName+'.sql'
  var tp=req.body.pType
  var cmd
  if (tp=='DtoF') {
    cmd='copy /Y .\\dbsql\\'+fn+' .\\sql\\'+fn
  } else if (tp=='FtoD') {
    cmd='copy /Y .\\sql\\'+fn+' .\\dbsql\\'+fn
  } 
  process.exec(cmd,function(error) {
    if (error) {
      console.log(error.message)
      res.sendStatus(503)  // Service unavailable
    } else {
      res.send({IQXResult:{attrs:{success:"1"}}})  
    }
})
})

router.get('/checkDbProc',function (req,res,next) {
  var dbfn='./dbsql/'+req.query.pName+'.sql'
  var flfn='./sql/'+req.query.pName+'.sql'
  var sdb,sfl,xtime,fllns,dblns
  try {
    sdb=_.trimRight(fs.readFileSync(dbfn))
    dblns=xLineCount(sdb)
  } catch(err) {
    sdb=''
  }
  try {
    sfl=_.trimRight(fs.readFileSync(flfn))
    fllns=xLineCount(sfl)
  } catch(err) {
    sfl=''
  }
  if (sdb) {xtime=fs.statSync(dbfn).mtime}
  var isDiff=true
  if (sdb && sfl) {
    isDiff=xDiff(sdb,sfl)
    }
  res.send({IQXResult:{attrs:{success:"1"},Row:{chkStamp:xtime,bDiff:isDiff,fileLines:fllns,dbLines:dblns}}})  
})

router.get('/uploadDbProc',function (req,res,next) {
  var fn='./dbsql/'+req.query.pName+'.sql'
  var s=fs.readFileSync(fn,{encoding:'utf8'})
  needle.post(config.iqxHubURL+'IQXCall/NetAPIProcSet', {pOwner:req.query.pOwner,pName:req.query.pName,pBody:s}, apiTools.buildOptions(req.headers), function(error, response) {
    if (error) {
        console.log(error.message)
        res.sendStatus(503)  // Service unavailable
    } else if (response.statusCode == 200) {  // Success
       parser.parseString(response.body, function (err, result) {
        if (result.IQXResult.attrs.success=='0') {
          res.send(result)
          return
        }
        res.send({IQXResult:{attrs:{success:"1"}}})  
       })
    } else {
      res.sendStatus(response.statusCode)
    }
  })
})

router.get('/makeJob', function (req,res,next) {
  try {
  var newline="\r\n",cnt=0,fileContents,procName
  var files=fs.readdirSync('./sql/')
  var fd=fs.openSync('./sql/iqxWebJobs.xml','w')
  fs.writeSync(fd,'<Job title="Net Database Procedure Import">'+newline)
  fs.writeSync(fd,'<IfYesDialog text="This job will update the Net database procedures. Ok to proceed?">'+newline)
  _.forEach(files,function(fileName) {
    if (!fileName.match(/[.]sql$/i)) {return}
    cnt++
    procName=fileName.replace(/[.]sql$/i, '')
    fs.writeSync(fd,'<SQLExec ignoreerror="YES">'+newline)
    fs.writeSync(fd,'<![CDATA[drop procedure pears.'+procName+']]>'+newline)
    fs.writeSync(fd,'</SQLExec>'+newline)
    fs.writeSync(fd,'<SQLExec parameters="NO">'+newline)
    fileContents=fs.readFileSync('./sql/'+fileName,{encoding:'utf8'})
    fileContents=_.trim(fileContents)
    fileContents=fileContents.replace(/^alter/i, 'create')
    fs.writeSync(fd,'<![CDATA['+fileContents+']]>'+newline)
    fs.writeSync(fd,'</SQLExec>'+newline)
    fs.writeSync(fd,'<SQLExec ignoreerror="YES">'+newline)
    fs.writeSync(fd,'<![CDATA[grant execute on pears.'+procName+' to IQXNet]]>'+newline)
    fs.writeSync(fd,'</SQLExec>'+newline)
    })
  fs.writeSync(fd,'</IfYesDialog>'+newline)
  fs.writeSync(fd,'</Job>'+newline)
  fs.closeSync(fd)
  res.send({IQXResult:{attrs:{success:"1"},Row:{procCount:cnt}}}) 
  } catch(e) {
    res.send(apiTools.IQXFailure(e.message))
  }    
  })


module.exports=router

