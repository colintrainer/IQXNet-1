var jwt=require('jwt-simple')
var needle = require('needle');
var config=require('./config')
var xml2js = require('xml2js')
var parser = new xml2js.Parser({trim:true,explicitArray:false,attrkey:'attrs',charkey:'message'});
var Q = require('q')
var _ = require('lodash')

var apiTools={}

apiTools.IQXCall=function(method,service,data,req,res,opts,parseIQXResult) {
  var options=_.extend(apiTools.buildOptions(req.headers,req.query),opts)
  var prom=Q.defer()
  needle.request(method, config.iqxHubURL+service, data, options, function(error, response) {
    if (error) {
      console.log(error.message)
      res.sendStatus(503)   // Service unavailable
      return prom.reject(error.message)
    } else if (response.statusCode == 200) {  // Success
      if (parseIQXResult) {
        return prom.resolve(apiTools.IQXResultParse(response,res))
      } else {
        return prom.resolve(response)
      }  
    } else {
      res.sendStatus(response.statusCode)
      return prom.reject(response.statusCode)
    }
    })
  return prom.promise
  }
  
apiTools.IQXResultParse=function(response,res) {
  var prom=Q.defer()
  parser.parseString(response.body, function (err, result) {
    if(err) {
      console.log(err)
      res.sendStatus(422)
      return prom.reject('Cannot parse XML response')
    } else if (result.IQXResult === undefined) {
      console.log('No IQXResult in XML response')
      res.sendStatus(422)
      return prom.reject('No IQXResult in XML response')
    } else if (result.IQXResult.attrs.success == '0') {
      res.send(result)
      return prom.reject('IQXResult indicates failure')
    }
    return prom.resolve(result)
    })
  return prom.promise
}

apiTools.extractQueryString = function (sURL) {
  var i=sURL.indexOf('?')
  if (i>0) {
    return sURL.substr(i)
  } else {
    return ''
    }
  }
  
apiTools.buildOptions = function (hdrs,qry) {
  var auth,contentType,charset
  if (hdrs['x-auth']) {
    try {
      auth=jwt.decode(hdrs['x-auth'],config.secret)
      }
    catch(err) {
      auth=undefined
      }
   } 
  if (hdrs['content-type']) {
    // Make sure the charset (usually UTF-8 when AJAX is used) is passed through to the hub or there will be corruption of non 7 bit characters
    var s=hdrs['content-type']
    var i=s.indexOf(';')
    if (i>0) {
      contentType=s.substr(0,i)
    } else {
      contentType=s
    }
    i=s.indexOf('charset=')
    if (i>0) {
      s=s.substr(i);
      i=s.indexOf(';') // In case there are more params
      if (i>0) {
        s=s.substr(0,i)
        }
      charset=s.trim()
      }
    }
  var opts={parse:false, json:false}
  if (auth) {
    opts.username=auth.username
    opts.password=auth.password
    }
  if (charset) {
    if (!contentType || contentType=='application/json') {contentType='application/x-www-form-urlencoded'}
    opts.headers={'Content-Type': contentType + '; ' + charset}  // NB note the case of Content-Type - content-type breaks Needle charset transmission
    }
  return opts
  }
  
apiTools.IQXFailure = function(sMessage) {
  return {IQXResult:
           {
            attrs:{success:'0'},
            IQXFailure:{attrs:{message:sMessage}}
           }
         }
  }

module.exports=apiTools

