angular.module('app')
.directive('ukDate', function ($filter) {

    var ukDateRE=/^(\d+)[/](\d+)[/](\d+)$/
    function shortYearAdjust(yy,refDate,epochAge) {
      yy=+yy // Force to numeric
      if (yy>100) {return yy}  // Nothing to do
      refDate=refDate || new Date()  // Based on today
      epochAge=epochAge || 90  // Adjust 2 digit year to between 90 years in the past and 10 years in the future
      var refy=refDate.getFullYear()
      var yyyy=(Math.floor(refy / 100) * 100) + yy  // Start in the refDate's century
      while (yyyy < refy+1-epochAge) {yyyy+=100}  // Then adjust to fit in the designated epoch
      while (yyyy > refy+100-epochAge) {yyyy-=100}
      return yyyy
      }

    return {
      require : 'ngModel',
      link : function($scope, element, attrs, ngModel) {

        ngModel.$formatters.push(function(modelDate) {
          if (angular.isDate(modelDate)) {
            return $filter('date')(modelDate, 'dd/MM/yyyy')
            }
          return modelDate // Leave alone if not a date
          })   
          
        ngModel.$parsers.unshift(function(viewDate) {
          if (viewDate == '' || viewDate == null || viewDate == undefined) {return null}  
          if (angular.isDate(viewDate)) {return viewDate}
          var ar=ukDateRE.exec(viewDate)
          if (!ar) {return undefined}  // Parser fail
          ar[3]=shortYearAdjust(ar[3])
          return new Date(ar[3],ar[2]-1,ar[1])
          })  
        
        ngModel.$validators.ukDate = function(modelDate,viewDate) {  // Called after the parser succeeds
          if (modelDate == null) {return true}   // Acceptable
          // The date constructor will turn any three numbers into some kind of date - so we now check to see that it matches the date we entered, which confirms validity
          var ar=ukDateRE.exec(viewDate)
          if (!ar) {return false}  
          ar[3]=shortYearAdjust(ar[3])
          return (modelDate.getFullYear()==ar[3] && modelDate.getMonth()+1==ar[2] && modelDate.getDate()==ar[1])
          }  
        
        }
        
      }
    })
      
		
