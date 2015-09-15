angular.module('app')
.controller('APIprocsCtrl', function ($scope, FormSvc, ApiSvc, ApplicationSvc, $q) {
  FormSvc.setOptions($scope)
  
  $scope.pOwner='pears'
  $scope.pRoot='Net'
  $scope.showDiffsOnly=false
  $scope.theRecords=[]  // Because fetch will check for any dirty records and prompt
  
  $scope.fetch=function () {
    var prom=$q.when('No edits or pending edits') // Fulfilled promise
    var bDirty=false;
    angular.forEach($scope.theRecords,function(proc){
      if (proc.bEditing || proc.bEdited) {bDirty=true}
      })
    if (bDirty) {prom=ApplicationSvc.messageDialog('Warning','You have possible or actual changes which may be over-written if you continue - are you sure?','Yes','No')}  // Replacement promise will be rejected if they say No and the fetch will not proceed
    return prom.then(function() {
      FormSvc.fetch($scope,{
        fetchAPI:'maint/getDbProcs?pOwner='+$scope.pOwner+'&pRoot='+$scope.pRoot,
        multiRow:true
        })
      })
    }
      
  $scope.showProc=function(proc) {
    if ($scope.showDiffsOnly) {
      return (proc.bDiff || proc.bEditing || proc.bEdited)
    } else {
      return true
    }
    }
    
  $scope.sortProc=function(proc) {
    return proc.procName.toUpperCase()
  }
  
  $scope.editSQL=function(proc,tp) {  // Invoke editor or comparison tool
    $scope.formError=''
    proc.bEditing=true
    return ApiSvc.exec($scope,'maint/editDbProc',{pName:proc.procName ,pType:tp})
  }
  
  $scope.copyProc=function(proc,tp) {   // copy between sql and dbsql folders
    $scope.formError=''
    return ApiSvc.exec($scope,'maint/copyDbProc',{pName:proc.procName ,pType:tp})
    .then(function(){
      proc.bEditing=false
      proc.bBoth=true
      proc.bDiff=false
      if (tp=='DtoF') {
        proc.fileLines=proc.dbLines
      } else {
        proc.dbLines=proc.fileLines
        proc.bEdited=true
        }
      return $scope.checkChanges(proc,'C')
      })
  }
  
  $scope.checkChanges=function(proc,mode) {  // Mode: S sync, U undo, C copy or check
    if (!mode) {mode='C'}  // Default
    $scope.formError=''
    return ApiSvc.fetch($scope,{fetchAPI:'maint/checkDbProc?pName='+proc.procName})
    .then(function(){
      proc.bEditing=false
      proc.fileLines=$scope.theRecord.fileLines
      proc.dbLines=$scope.theRecord.dbLines
      proc.bBoth=(proc.fileLines && proc.dbLines)
      if (proc.bBoth) {
        proc.bDiff=$scope.theRecord.bDiff
      } else {
        proc.bDiff=true
      }
      if (mode=='S' || mode=='U') {proc.dbStamp=$scope.theRecord.chkStamp}
      proc.bEdited=($scope.theRecord.chkStamp != proc.dbStamp)
      })
  }
  
  $scope.syncChanges=function(proc) {  // Upload procedure from the database
    $scope.formError=''
    return ApiSvc.fetch($scope,{fetchAPI:'maint/uploadDbProc?pOwner=pears&pName='+proc.procName})
    .then(function(){
      proc.bEditing=false
      proc.bEdited=false
      return $scope.checkChanges(proc,'S')
      })
    .catch(function(error){
      ApplicationSvc.messageDialog('Error',error,'Ok') // This will almost certainly be a procedure code error - handy to display in a popup
      return $q.reject(error)
      })
  }
  
  $scope.undoChanges=function(proc) {  // Revert the file copy to the database version (including file delete if proc not present on database)
    $scope.formError=''
    return ApiSvc.fetch($scope,{fetchAPI:'maint/getDbProc?pOwner=pears&pName='+proc.procName})
    .then(function(){
      proc.bEditing=false
      proc.bEdited=false
      return $scope.checkChanges(proc,'U')
      })
    }
  
})
