var needle = require('needle')
var _ = require('lodash')
var xml2js = require('xml2js')
var parser = new xml2js.Parser({trim:true,explicitArray:false,attrkey:'attrs',charkey:'message'})
var config=require('./config')
var Q = require('q')
var chai=require('chai')
chai.use(require('chai-as-promised'))
var testPassword='pa55word'  // This must the be password for the admin user, whose login id must be ADMINISTRATOR

var iqTest={}

function omniTranslate(x,tp) {
  if (Buffer.isBuffer(x)) {x=x.toString('utf8')}
  if (_.isString(x)) {
    if (tp=='string') {return x}
    if (tp=='object') {return JSON.parse(x)}
  } 
  if (_.isObject(x)) {
    if (tp=='string') {return JSON.stringify(x)}
    if (tp=='object') {return x}
  }
  }

iqTest.exec=function(sService,sUser,xData,sMode) {
  xData=xData || {}
  sMode=sMode || ''   // By default success requires an <IQXResult success="1"> - for other modes see comments below
  var prom=Q.defer();
  needle.post(config.iqxHubURL+sService, xData, { username: sUser, password: testPassword, parse:false}, function(error, response) {
    if (error) {return prom.reject(error.message)}
    if (sMode=='status') {return prom.resolve(response.statusCode)}  // Succeed with any REST code
    if (response.statusCode == 200) {  // Success
        if (sMode=='string') {return prom.resolve(omniTranslate(response.body,'string').trim())}  // Succeed with any string data
        if (sMode=='object') {return prom.resolve(omniTranslate(response.body,'object'))}  // Succeed with any JSON object
        parser.parseString(response.body, function (error, data) {
          if (error) {return prom.reject(error)}
          if (data.IQXResult == undefined) {return prom.reject('IQXResult missing')}
          if (sMode=='IQXFailure') { // We expect and wish to analyse an IQXFailure 
            if (data.IQXResult.attrs.success == '1') {return prom.reject('Expected IQXFailure - found success')}
            if (data.IQXResult.IQXFailure == undefined) {return prom.reject('IQXFailure object missing')}
            return prom.resolve(data.IQXResult.IQXFailure.attrs)
            }
          if (data.IQXResult.attrs.success == '0') {return prom.reject(data.IQXResult.IQXFailure.attrs.message)}
          prom.resolve(data.IQXResult)
        })
    } else {
      prom.reject('Failed with REST code '+response.statusCode)
    }
  })
  return prom.promise
}

iqTest.all=Q.all
iqTest.expect=chai.expect
iqTest.should=chai.should()
iqTest.assert=chai.assert

module.exports=iqTest

