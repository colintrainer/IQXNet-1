angular.module('app')
.controller('CandProvTSCtrl', function ($scope, $location, FormSvc) {
  FormSvc.setOptions($scope,{
      fetchAPI:'callresult/netcandprovtimesheets',
      dateFields:['weekenddate'],
      multiRow:true
      })
    
  $scope.expandTimesheet=function(tsid) {
    $location.url('/provtimesheet?id='+tsid)
    }
    
	$scope.fetch()
})
