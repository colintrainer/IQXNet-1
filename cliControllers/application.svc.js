angular.module('app')
.service('ApplicationSvc', function ($http, $window, $modal) {
  var svc=this
  svc.isLoggedIn=false
  svc.currentUser={}
  svc.postLoginRoute='/'
  svc.isEditing=false
  svc.autoEdit=false
  var tempSess=$window.sessionStorage.getItem('IQXSession')
  if (tempSess) { 
    svc.currentUser=angular.fromJson(tempSess)
    svc.isLoggedIn=true
    $http.defaults.headers.common['X-Auth']=svc.currentUser.token
    }
    
  function makeArray(s) {
    return (s?s.split(','):[])
    }
    
  svc.changePassword=function (Data) {
    svc.currentUser.token=Data.token
    svc.currentUser.forceChangePassword=false
    $http.defaults.headers.common['X-Auth']=Data.token
    $window.sessionStorage.setItem('IQXSession', JSON.stringify(svc.currentUser))  // Replace persistent login details
  }
    
  svc.setLoggedIn=function (LoginData) {
    svc.currentUser=LoginData.IQXResult
    svc.currentUser.token=LoginData.token
    svc.currentUser.forceChangePassword=LoginData.forceChangePassword
    svc.currentUser.UserRights=makeArray(svc.currentUser.UserRights)
    svc.currentUser.Switches=makeArray(svc.currentUser.Switches)
    $http.defaults.headers.common['X-Auth']=LoginData.token
    svc.isLoggedIn=true
    $window.sessionStorage.setItem('IQXSession', JSON.stringify(svc.currentUser))  // Persist login details until session is ended or explicitly logged out i.e. they survive a browser refresh
    }
    
  svc.setLoggedOut=function () {
    $window.sessionStorage.removeItem('IQXSession')
    delete $http.defaults.headers.common['X-Auth']
    svc.currentUser={}
    svc.isLoggedIn=false
    }
    
  svc.messageDialog=function (caption, message, okText, cancelText, bSucceedIfCancel) {
    return $modal.open({
      templateUrl: 'views/modalDialog.html',
      size: 'sm',
      controller:'ModalCtrl',
      resolve: {
        getModalVars: function() {
          return {title:caption,text:message,yesText:okText,noText:cancelText,succeedIfCancel:bSucceedIfCancel}
          }
         }
      }).result
    }
    
  svc.forceChangePassword=function() {
    return svc.currentUser.forceChangePassword
    }


})
.controller('ModalCtrl', function ($scope, getModalVars) {
  $scope.xModal=getModalVars
})


