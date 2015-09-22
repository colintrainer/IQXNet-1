angular.module('app')
.controller('ChangePasswordCtrl', function ($scope, $location, FormSvc, ApplicationSvc) {
   FormSvc.setOptions($scope,{
      fetchAPI:{}, // No data fetch - initialise with empty record
      autoEdit:true, // Switch form straight to edit mode
      })
  
  $scope.save=function () {
    $scope.setSubmitted(true) // Ensure all validation errors appear
    if ($scope.theForm.$invalid) {return}
    $scope.exec('auth/changepassword',$scope.theRecord)
    .then(function(res) {
      ApplicationSvc.changePassword(res)
      var p=ApplicationSvc.postLoginRoute // If this is a forced password change navigate to wherever was last requested in the un-loggedin state (default=/)
      ApplicationSvc.postLoginRoute='/'   // Reset the default
      $location.path(p) 
    })
  }
  $scope.forceChangePassword=ApplicationSvc.forceChangePassword()
  $scope.fetch()  // Complete the initialise
    
})
