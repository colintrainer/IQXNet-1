var expect = require('chai').expect
describe('Misc', function(){
    it('Should be rational', function(){
      expect(1).to.equal(1);
      expect(2).not.to.equal(1);
    })
})