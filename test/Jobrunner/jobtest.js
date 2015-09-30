var iq=require('../../srvControllers/iqTest')
var exec=iq.exec
var expect=iq.expect
var should=iq.should

  // NBB we are in a promise environment - make sure you always RETURN the assertion or the test will automatically succeed without waiting
  
describe('Jobrunner Tests', function(){
  it('Basic', function(){
    return expect(exec('IQXJob/Test0simple','test.user.candidate',{},'string')).to.eventually.equal('Simple')
  })
  
  it('Simple SQL', function(){
    return expect(exec('IQXJob/Test0SQL1','test.user.candidate',{},'string')).to.eventually.equal('test.user.nobody')
  })
  
  it('UserStaffID', function(){
    return expect(exec('IQXJob/Test0sql2','test.user.candidate',{},'string')).to.eventually.equal('Success')
  })
  
  it('Simple Blob', function(){
    return expect(exec('IQXJob/Test0blob1','test.user.candidate',{},'string')).to.eventually.equal('MOCHATEST')
  })
  
  it('Simple JSON', function(){
    var prom=exec('IQXJob/Test0json1','test.user.candidate',{},'object')
    return iq.all([
      prom.should.eventually.have.property('Name','Sid'),
      prom.should.eventually.have.property('Age',21)
      ])
  })
  
  it('Waits 1 Second', function(){
    return expect(exec('IQXJob/Test0sqlWait','test.user.candidate',{},'string')).to.eventually.equal('Done')
  })
  

  
})
  

