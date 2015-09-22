angular.module('app')
.controller('TimesheetCtrl', function ($scope, $location, $routeParams, FormSvc) {
  FormSvc.setOptions($scope)
  $scope.TSID=$routeParams.id  
  
  $scope.fetchTimesheet=function() {
    return $scope.fetch({fetchAPI:'callresult/nettimesheet?pTempTimesheetID='+$scope.TSID,
      fetchTarget:'timesheet',dateFields:['weekenddate','completedat'],
      })
    }
    
  $scope.fetchTimesheetShifts=function() {
    return $scope.fetch({fetchAPI:'callresult/nettimesheetshifts?pTempTimesheetID='+$scope.TSID, 
      fetchTarget:'timesheetShifts',multiRow:true,dateFields:['weekenddate','shiftdate']})
    }
  
  $scope.fetchTimesheetTimes=function() {
    return $scope.fetch({fetchAPI:'callresult/nettimesheettimes?pTempTimesheetID='+$scope.TSID, 
      fetchTarget:'timesheetTimes',multiRow:true,dateFields:['weekstartdate','shiftdate'],booleanFields:['dayticked']})
    }
  
  $scope.fetchTimesheetRates=function() {
    return $scope.fetch({fetchAPI:'callresult/nettimesheetrates?pTempTimesheetID='+$scope.TSID, 
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
      return $scope.fetchTimesheetRates()
      })
    }
    
// The initialisation code:    
  if ($scope.TSID) {
    $scope.load()
  } else {
    $scope.formError='Timesheet ID not specified'
    }
    
})
