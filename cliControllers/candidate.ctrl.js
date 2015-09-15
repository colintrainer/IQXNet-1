angular.module('app')
.controller('CandidateCtrl', function ($scope, FormSvc, QuestionnaireSvc) {
    FormSvc.setOptions($scope,{
      fetchAPI:'callresult/netcandidateprofile',
      saveAPI:'call/netcandidateprofileset',
      savePrefix:'p',
      dateFields:['DOB'],
      primaryKey:'PersonID',
      questionnaire:{
        tagTarget:'tags',
        tagLocation:'P',
        postVar:'qanswers'
        }
      })
    
    $scope.fetch()
    
})
