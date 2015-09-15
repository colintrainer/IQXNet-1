angular.module('app')
.controller('CandDocsCtrl', function ($scope, $window, $q, $timeout, $http, FormSvc, ApplicationSvc, ApiSvc, Upload) {
  FormSvc.setOptions($scope,{
      fetchAPI:'callresult/netcandidatedocuments',
      multiRow:true
      })

  $scope.theRecord={}
  
  $scope.showDocument=function(doc) {
    doc.downloadError=''
    $http.get('/api/document/doxi',{params:{id:doc.DocumentID,personid:doc.PersonID,type:doc.SpecialType}})
    .then(function(res) {
      $window.open('/api/document/download?doxi='+res.data,'_blank')
      })
    .catch(function(err) {
      doc.downloadError=ApiSvc.ExtractError(err)
      })
    }
  
  $scope.uploadSelect=function(files,file,event) {
    $scope.theForm.file.$touched=true  // Show any validation error on the selected file
    }
    
  $scope.uploadCleanup=function() {
    $scope.reset()
    $scope.uploadProgress=''
    $scope.uploadError=''
    $scope.theRecord={}
    }
  
  $scope.uploadFileName=function() {
    if ($scope.theRecord.file) {
      return $scope.theRecord.file.name
     } else {
      return 'Select file..'
     }
    }
    
  $scope.showUploadProgress=function(evt) {
    var s='Uploading...'
    if (evt && evt.total) {  // progress callback
      s=s + parseInt(100.0 * evt.loaded / evt.total) + '%'
      }
    $scope.uploadProgress=s
    }
    
  $scope.uploadExecute=function() {
    $scope.setSubmitted(true) // Ensure all validation errors appear
    if ($scope.uploadProgress || $scope.theForm.$invalid) {return}
    $scope.uploadError=''
    $scope.showUploadProgress()
    Upload.upload({
      url:'/api/document/upload',
      file:$scope.theRecord.file,
      fileFormDataName:'file',
      headers:{'X-Auth':ApplicationSvc.currentUser.token},
      fields:{'Type':$scope.theRecord.Type,
              'Description':$scope.theRecord.Description,
              'PersonID':$scope.xPerson.PersonID}
    })
    .then(function (res) {
      ApiSvc.CheckIQXResult(res.data)  // Checks the IQXResult construct and, if failed, throws exception with the message
      $scope.uploadProgress='Upload complete'
      return $timeout(function() {}, 2000)  // Display the Upload complete message for 2 seconds before refreshing and cleaning up
      }, null, $scope.showUploadProgress) // 3rd arg is the progress callback
    .then(function() {
      return $scope.fetch()  // Refresh the list
      })
    .then(function() {
      $scope.uploadCleanup()
      })
    .catch(function (err) {
      $scope.uploadProgress=''
      return $q.reject($scope.uploadError=ApiSvc.ExtractError(err))
      })
    }
  
 	$scope.fetch()
  .then(function() {
    return $scope.fetch({fetchAPI:'callresult/netuploadtypes?pOwnerType=P',fetchTarget:'xUploadTypes'})
    })
  .then(function() {
    $scope.uploadTypes=FormSvc.unSpliceSelectList($scope.xUploadTypes.UploadTypes)
    })
  .then(function() {
    if ($scope.theRecords && $scope.theRecords.length) { // If any documents were downloaded take the first PersonID from them
      $scope.xPerson={PersonID:$scope.theRecords[0].PersonID}
    } else {  // If not then need explicit fetch of PersonID
      return $scope.fetch({fetchAPI:'callresult/netcandidatepersonid',fetchTarget:'xPerson'})
    }
    })
    
})
