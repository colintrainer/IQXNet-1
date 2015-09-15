var needle = require('needle')
var xml2js = require('xml2js')
var parser = new xml2js.Parser({trim:true,explicitArray:false,attrkey:'attrs',charkey:'message'})

var Q = require('q')

// Promise versions of our standard iqxnet plumbing
var needleGet = Q.denodeify(needle.get)
var parserjs = Q.denodeify(parser.parseString)

var chai=require('chai')
chai.use(require('chai-as-promised'))
var expect=chai.expect

var desres=needleGet('http://localhost:54000/IQXService_/Test', {username: 'ADMINISTRATOR', password: 'pa55word', parse:false})
  .then(function(response) {
    response=response[0]
    return parserjs(response.body)
    })

describe('Hub test', function(){
  // NBB when using chai-as-promised, make sure you always RETURN the assertion or the test will automatically succeed without waiting
  it('Conn test', function(){
    return expect(desres).to.be.fulfilled
    })
  // If using multiple chai-as-promised assertions in one 'it', you must use Q.all to bundle them since you need to return a single promise
  it('Success test', function(){
    return Q.all([
      expect(desres).to.eventually.have.deep.property('IQXResult.attrs.success','1'),
      expect(desres).to.eventually.have.deep.property('IQXResult.message'),
      ])
    })
  })
  

