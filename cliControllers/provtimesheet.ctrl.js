angular.module('app')
.controller('ProvTSCtrl', function ($scope, $routeParams, $q, FormSvc) {
  FormSvc.setOptions($scope)
  $scope.ProvTSID=$routeParams.id  
  
  $scope.fetchTimesheet=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheet?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheet',dateFields:['weekenddate']})
    }
  
  $scope.fetchTimesheetShifts=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheetshifts?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheetShifts',multiRow:true,dateFields:['weekenddate','shiftdate'],booleanFields:['tick']})
    }
  
  $scope.fetchTimesheetTimes=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheettimes?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheetTimes',multiRow:true,dateFields:['weekstartdate','shiftdate'],booleanFields:['dayticked']})
    }
  
  $scope.fetchTimesheetRates=function() {
    return $scope.fetch({fetchAPI:'callresult/netprovtimesheetrates?pTempProvTimesheetID='+$scope.ProvTSID, 
      fetchTarget:'timesheetRates',multiRow:true})
    }
  
  $scope.load=function() {
    $scope.timesheet={}
    $scope.shiftTimesheet=false
    $scope.timeTimesheet=false
    return $scope.fetchTimesheet()
    .then(function () {   
      if ($scope.timesheet.timesheettype=='S') {
        $scope.shiftTimesheet=true
        return $scope.fetchTimesheetShifts()
      } else if ($scope.timesheet.timesheettype=='T') {
        $scope.timeTimesheet=true
        return $scope.fetchTimesheetTimes()
        }
      })
    .then(function () {
      if ($scope.timesheet.completed==1) {
        $scope.completedTimesheet=true
        return $scope.fetchTimesheetRates()
        }
      })
    }
    
  $scope.calc=function() {
    $scope.timesheetRates=[]
    var aShifts=[]
    angular.forEach($scope.timesheetShifts, function(value) {
      if (value.tick) {aShifts.push(value.tempshiftid)}
      })
    return $scope.exec('call/NetProvTimesheetShiftsSelect',{pTempProvTimesheetID:$scope.ProvTSID,pShiftList:aShifts.join()})
    .then(function() { 
      return $scope.exec('service/ProvTSProcessRateScript',{id:$scope.ProvTSID})
      })
    .then(function() {
      $scope.completedTimesheet=true
      return $scope.fetchTimesheetRates()
      })
    }
    
    
// The initialisation code:    
  if ($scope.ProvTSID) {
    $scope.load()
  } else {
    $scope.formError='Timesheet ID not specified'
    }
    
})
