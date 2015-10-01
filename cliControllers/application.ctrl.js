angular.module('app')
  .controller('ApplicationCtrl',function ($scope, ApplicationSvc) {
    $scope.params=ApplicationSvc.params
    
    $scope.logout=function () {
        ApplicationSvc.setLoggedOut()
      }
    $scope.isLoggedIn=function () {
      return ApplicationSvc.isLoggedIn
      }
    $scope.userName=function () {
      return ApplicationSvc.currentUser.UserName
      }
    $scope.userClass=function () {
      return ApplicationSvc.currentUser.UserClass
      }
    $scope.userHasRight=function (right) {
      return (ApplicationSvc.currentUser.UserRights && ApplicationSvc.currentUser.UserRights.indexOf(right)>=0)
      }
    $scope.isSwitchedOn=function (xSwitch) {
      return (ApplicationSvc.currentUser.Switches && ApplicationSvc.currentUser.Switches.indexOf(xSwitch)>=0)
      }
    })
    