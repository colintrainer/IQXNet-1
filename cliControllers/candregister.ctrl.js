angular.module('app')
.controller('CandRegCtrl', function ($scope, FormSvc, QuestionnaireSvc, ApplicationSvc, $location) {
    var testData={Email:'xxx@xxx.co.uk',
                  RepeatEmail:'xxx@xxx.co.uk',
                  Password:'abcdefA.1',
                  RepeatPassword:'abcdefA.1',
                  Forenames:'Herbert Horace',
                  Surname:'Ffucke-Witte',
                  DOB:'xxx 15/05/1955',
                  Addr1:'The Hole',
                  Postcode:'TD99 9JT'
                  }
  
    FormSvc.setOptions($scope,{
      fetchAPI:testData,   //{}, // No data fetch - initialise with empty record
      saveAPI:'candregister', 
      notLoggedIn:true, // New candidate so obviously not yet logged in
      autoEdit:true, // Switch form straight to edit mode
      saveCleanFields:true, // All fields sent, whether or not dirty
      savePrefix:'p',
      dateFields:['DOB'],
      questionnaire:{
        tagTarget:'tags',
        tagLocation:'P',
        postVar:'qanswers'
        }
      })
      
    $scope.saveButtonCaption='Register'
    
    $scope.update=function () {  // Over-ride the default update() called by the Register button
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
