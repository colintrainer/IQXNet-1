angular.module('app')
.controller('CandDiaryCtrl', function ($scope, FormSvc) {
    FormSvc.setOptions($scope,{
      fetchAPI:'callresult/netcandidatediary',
      multiRow:true
      })
      
  function extractDateTime(dt,tm) {
    if (dt.indexOf(' ') == 3) {dt=dt.substr(4)}
    return moment(dt+' '+tm,'DD/MM/YYYY HH:mm').toDate()
    }
    
  function extractType(tp) {
    if (tp == 'Holiday' || tp == 'Unavailable') {return 'warning'}
    if (tp == 'Available') {return 'info'}
    return 'inverse'
    }
    
  $scope.eventClicked=function(evt) {alert('clicked')}
  $scope.eventEdited=function(evt) {alert('edit')}
  $scope.eventDeleted=function(evt) {alert('delete')}
    
  $scope.events=[]
  $scope.calendarView='month'
  $scope.calendarDay=new Date() // today
   
  $scope.fetch()
  .then(function() {
    $scope.events=[]
    angular.forEach($scope.theRecords,function(row) {
      $scope.events.push({title:row.DiaryClass,type:extractType(row.DiaryClass),startsAt:extractDateTime(row.DateFrom,row.TimeFrom || '00:00'),endsAt:extractDateTime(row.DateTo,row.TimeTo || '23:59')})
      })
    }) 
})
