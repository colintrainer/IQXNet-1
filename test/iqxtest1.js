var iq=require('../srvControllers/iqTest')
var exec=iq.exec
var expect=iq.expect
var should=iq.should

describe('IQXNet Test', function(){
  // NBB we are in a promise environment - make sure you always RETURN the assertion or the test will automatically succeed without waiting
  
  it('Set up', function(){
    return expect(exec('IQXCall/NetTestSetup','ADMINISTRATOR',{})).to.be.fulfilled
    })
    
  it('Reality checks', function(){
    return iq.all([
      expect(exec('IQXCall/NetTestLoop','test.user.nobody',{pReturn:'0:~Success'},'status')).to.eventually.equal(401),  // This login has expired
       expect(exec('IQXCall/NetTestLoop','test.user.candidate',{pReturn:'0:~Success'},'status')).to.eventually.equal(200),
      expect(exec('IQXCall/NetTestLoop','test.user.candidate',{pReturn:'35:~Failure'})).to.be.rejected,
      expect(exec('IQXCall/NetTestLoop','test.user.candidate',{pReturn:'0:~Success'},'IQXFailure')).to.be.rejected,
      expect(exec('IQXCall/NetTestLoop','test.user.candidate',{pReturn:'27:~Failure'},'IQXFailure')).to.eventually.have.property('errornumber','27'),
      expect(exec('IQXCall/NetTestLoop','test.user.candidate',{pReturn:'99:~Not Allowed'},'IQXFailure')).to.eventually.have.property('message','Not Allowed')
      ])
    })
    
  it('Post candidate details', function(){
    return expect(exec('IQXCall/NetCandidateProfileSet','test.user.candidate',{ppersonid:'test',pforenames:'Arthur',psurname:'Jenkins'})).to.be.fulfilled
    })
    
  it('Retrieve and check candidate details', function(){
    var desres=exec('IQXCallResult/NetCandidateProfile','test.user.candidate')
  // Bundle multiple promises with 'all'
    return iq.all([
      desres.should.eventually.have.deep.property('Row.Forenames','Arthur'),
      desres.should.eventually.have.deep.property('Row.Surname','Jenkins'),
      ])
    })
    
  it('x-auth checks', function(){
    return iq.all([
      expect(exec('IQXCall/NetTestLoop','',{pReturn:'0:~Success'},'status')).to.eventually.equal(401),  // No credentials
      expect(exec('IQXCall/NetTestLoop','',{"x-auth":'test.user.candidate!'+iq.password,pReturn:'0:~Success'})).to.eventually.to.be.fulfilled
      ])
    })
    
  })
  

