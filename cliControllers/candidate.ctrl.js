angular.module('app')
.controller('CandidateCtrl', function ($scope, $location, FormSvc, QuestionnaireSvc) {
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
      
    $scope.changePassword=function() {
      $location.path('/changepassword')
      }
    
    $scope.fetch()
    
})
