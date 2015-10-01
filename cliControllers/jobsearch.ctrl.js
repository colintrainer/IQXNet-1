angular.module('app')
.controller('JobSearchCtrl', function ($scope, FormSvc, QuestionnaireSvc, ApplicationSvc, $location) {
    var testData={WebUserID:'ind',
                  VacancyType:'0',
                  MinimumPay:'20000',
                  MaximumPay:'30000',
                  Location:'Edinburgh',
                  KeywordSearch:'and',
                  PageNumber:'3',
                  PageSize:'20'
                  } // Assign to fetchAPI for easy testing - passes all the validations
  
    FormSvc.setOptions($scope,{
      fetchAPI:{}, // No data fetch - initialise with empty record
      saveAPI:'register/candidate', 
      notLoggedIn:true, // New candidate so obviously not yet logged in
      autoEdit:true, // Switch form straight to edit mode
      saveCleanFields:true, // All fields sent, whether or not dirty
      savePrefix:'p',
      questionnaire:{
        tagTarget:'tags',
        tagLocation:'P',
        postVar:'qanswers'
        }
      })
     

    $scope.saveButtonCaption='Search'
    
    $scope.update=function () {  // Over-ride the default update() called by the Search button
      return FormSvc.update($scope,true)  // Save only - do not do the fetch
        .then(function(res) {
          ApplicationSvc.isEditing=false
          ApplicationSvc.setLoggedIn(res)
          $location.path('/')  
        })
	    }
      
    $scope.$watch('theRecord.Email', function(newValue, oldValue) {
      $scope.theRecord.UserName=newValue  // Email address is default username which they can then edit
      })

    $scope.fetch()  // Initialise
   
})
