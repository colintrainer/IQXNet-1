angular.module('app')
.controller('TestCtrl', function ($scope, $location, FormSvc, ApplicationSvc) {
  FormSvc.setOptions($scope)
    
  $scope.doTest=function() {
    ApplicationSvc.messageDialog('Test','Press a button','Ok','Cancel',true)
    .then(function(res){
      if (res) {
        alert('Oked')
      } else {
        alert('Cancelled')
      }
    })
    .catch(function(){
      alert('Abandoned')  // Clicked outside the dialog or Escape key pressed
    })
    }
    

  })
