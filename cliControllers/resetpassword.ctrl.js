angular.module('app')
.controller('ResetPasswordCtrl', function ($scope, FormSvc) {
   FormSvc.setOptions($scope,{
      fetchAPI:{}, // No data fetch - initialise with empty record
      autoEdit:true, // Switch form straight to edit mode
      notLoggedIn:true
      })
  
  $scope.save=function () {
    console.log($scope)
    $scope.setSubmitted(true) // Ensure all validation errors appear
    if ($scope.theForm.$invalid) {return}
    $scope.exec('call_/netforgottenpassword',$scope.theRecord)
    .then(function(res) {
      $scope.wasSent=true
    })
  }
  $scope.wasSent=false
  $scope.fetch()  // Complete the initialise
    
})
