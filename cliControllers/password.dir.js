angular.module('app')
  
  .directive('enforcePasswordStrength', [
    function() {
      return {
        require: "ngModel",
        restrict: 'A',
        link: function(scope, elem, attrs, ngModel) {
          ngModel.$validators.passwordStrength=function(modelValue) {
            var patt = /(?=.*\d)(?=.*[A-Z])(?=.*\W).{8,}/
            return patt.test(modelValue)  // Must be at least 8 chars and contain at least one digit, capital and punctuation char
          }
        }
      }
    }
  ])           

  .directive('matchField', [
    function() {
      return {
        require: "ngModel",
        restrict: 'A',
        scope: {
          otherModelValue: "=matchField"
        },
        link: function(scope, element, attributes, ngModel) {
          ngModel.$validators.matchField = function(modelValue) {
            return (modelValue == scope.otherModelValue)
          }
          scope.$watch("otherModelValue", function() {
            ngModel.$validate()
          })
        }
      }
    }
  ])
  