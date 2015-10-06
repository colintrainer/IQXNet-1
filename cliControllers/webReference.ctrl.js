angular.module('app')
.controller('webReferenceCtrl', function ($scope, $location, $routeParams, $q, FormSvc, ApplicationSvc) {
  FormSvc.setOptions($scope)

  $scope.refCode=window.location.hash.replace("#/webReference?","")
  $scope.showForm=false
  $scope.isSubmitted=false
  $scope.postCompletedForm=false

  $scope.fetchDepartmentID=function(){ // Returns the department based on the URLRefCode
    if (!$scope.refCode) {return $q.reject($scope.formError='Missing URLReferenceCode')}
    return $scope.fetch({
      fetchAPI:'callresult_/NetReference?pReferenceRequestCode='+$scope.refCode,
      fetchTarget:'preRef',
      notLoggedIn:true
    })
  }

  $scope.myUpdate=function () {  // Over-ride the default update() called by the Save & Submit button
    if (!$scope.theForm.$valid) {return}
    FormSvc.setSubmitted($scope,true)
    ApplicationSvc.messageDialog ('Save & Submit?', 'You can save the form and come back to it at a later date or you can Save & Submit the form (you wont be able to edit it after this)', 'Save & Submit', 'Save ONLY', true)
    .then(function(res){   // res will be true if submitted/completed, false if save only
        $scope.postCompletedForm=res
        $scope.theRecord.Completed=res ? 1 : 0;
        return FormSvc.update($scope,res)  // Do not do the fetch if submitted
          .then(function() {
            $scope.showForm=!res
            $scope.isCompleted=res
            if (!res) ApplicationSvc.messageDialog ('Save Successful', 'The reference has been saved, you can now return to this form at a later date using the emailed URL.', 'OK', '')
          })
      })
    }
  
  $scope.fetchDepartmentID() // Get the department ID so it can fetch the correct questions
  .then(function() {
    if(!$scope.preRef.DepartmentID) {return $q.reject($scope.formError='Invalid URLReferenceCode')}

    FormSvc.setOptions($scope,{
      fetchAPI:'callresult_/NetReference?pReferenceRequestCode='+$scope.refCode,
      saveAPI:'call_/NetReferenceSet', 
      notLoggedIn:true, // we dont need them logged in =D
      autoEdit:true, // Switch form straight to edit mode
      saveCleanFields:true, // All fields sent
      primaryKey:"ReferenceRequestID",
      savePrefix:'p',
      dateFields:[],
      questionnaire:{
        tagTarget:'tags',
        tagLocation:'R'+$scope.preRef.DepartmentID,
        id:$scope.preRef.ReferenceRequestID,
        postVar:'qanswers'
        }
      })
      $scope.update=$scope.myUpdate // call out custom update procedure before calling the normal one.
      return $scope.fetch()
    })
  .then(function(){
    $scope.showForm=true
  })  

  $scope.saveButtonCaption='Save & Submit'
})