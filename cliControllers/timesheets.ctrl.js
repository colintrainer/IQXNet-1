angular.module('app')
.controller('TimesheetsCtrl', function ($scope, $location, FormSvc) {
  FormSvc.setOptions($scope,{
      fetchAPI:'callresult/nettimesheets',
      dateFields:['weekenddate'],
      multiRow:true,
      sliceSize:20
      })
    
  $scope.expandTimesheet=function(tsid) {
    $location.url('/timesheet?id='+tsid)
    }
    
	$scope.fetch()

  })
