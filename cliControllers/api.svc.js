angular.module('app')
.service('ApiSvc', function ($http, $filter, $q, ApplicationSvc) {
	var svc=this

	svc.StringToDate=function (sDate) {
	   if (sDate) {
	    return new Date(sDate.substr(10,4),sDate.substr(7,2)-1,sDate.substr(4,2))
		 } else {
			return null
		 }
		}
    
  svc.SafeJSONValue=function (val) {
     if (angular.isDate(val)) {
      return $filter('date')(val, 'dd/MM/yyyy')
     } else if (typeof val == 'boolean') {
      return (val ? 1 : 0)
     } else {
      return val
     }
    }
    
  svc.ValuesAreEqual=function (x,y) {
    if (angular.isDate(x) && angular.isDate(y)) {
      return (x.getTime() == y.getTime())
     } else {
      return (x === y)
     }
    }
    
  svc.IQXResultSucceeded=function (rowData) {
    var x={}    // Construct a successful IQXResult with the rowData supplied
    x.attrs={success:1}
    x.Row=rowData
    return $q.when({data:{IQXResult:x}})   // return as a fulfilled promise
    }
    
  svc.CheckIQXResult=function (data) {
    if (data.IQXResult == undefined) {throw 'IQXResult missing'}
    if (data.IQXResult.attrs.success == '0') {throw data.IQXResult.IQXFailure.attrs.message}
    }
    
  svc.ExtractError=function (err) {
    if (angular.isObject(err)) {
      return err.data || 'Web Server Unavailable'
    } else {
      return err
      }
    }
     
	svc.fetch=function (scope,options) {
    var theResult, doFetch
    if (!options.fetchAPI) {return $q.reject(scope.formError='No fetchAPI in options')}
		if (!ApplicationSvc.isLoggedIn && !options.notLoggedIn) {return $q.reject(scope.formError='Not logged in')}
    if (angular.isString(options.fetchAPI)) {
      doFetch=$http.get('/api/'+options.fetchAPI)
    } else {
      doFetch=svc.IQXResultSucceeded(options.fetchAPI)
    }
		return doFetch  
			.then(function (res) {
        svc.CheckIQXResult(res.data)  // Checks the IQXResult construct and, if failed, throws exception with the message
        if (options.multiRow) {
          if (res.data.IQXResult.Row == undefined) {
            theResult=[]
          } else if (angular.isArray(res.data.IQXResult.Row)) {
            theResult=res.data.IQXResult.Row
          } else {  // Make single row into an array
            theResult=[res.data.IQXResult.Row]
          }          
        } else {  // Single row expected
          if (res.data.IQXResult.Row == undefined) {
            theResult={}
          } else if (angular.isArray(res.data.IQXResult.Row)) {  // Extract first row or empty object if none
            theResult=(res.data.IQXResult.Row.length>0) ? res.data.IQXResult.Row[0] : {}
          } else {  
            theResult=res.data.IQXResult.Row
           }          
          }
        angular.forEach(options.dateFields, function (value) {
          if (options.multiRow) {
            angular.forEach(theResult, function (row) {
              if (row[value] != undefined) {
                row[value]=svc.StringToDate(row[value])
                }
              })
          } else if (theResult[value] != undefined) {
            theResult[value]=svc.StringToDate(theResult[value])
            }
          })
        angular.forEach(options.booleanFields, function (value) {
          if (options.multiRow) {
            angular.forEach(theResult, function (row) {
              if (row[value] != undefined) {
                row[value]=(row[value] == 1)
                }
              })
          } else if (theResult[value] != undefined) {
            theResult[value]=(theResult[value] == 1)
            }
          })
        if (options.fetchTarget) {
          scope[options.fetchTarget]=theResult
        } else if (options.multiRow) {
          scope.theRecords=theResult
        } else {
          scope.theRecord=theResult
          }
				})
			.catch(function (err) {
				return $q.reject(scope.formError=svc.ExtractError(err))
				})
		}
    
  svc.exec=function(scope,api,postObject,notLoggedIn) {
		if (!(ApplicationSvc.isLoggedIn || notLoggedIn)) {return $q.reject(scope.formError='Not logged in')}
    var postvars={}
    angular.forEach(postObject, function (value,key) {
      postvars[key]=svc.SafeJSONValue(value)
      })
    return $http.post('/api/'+api,postvars)
      .then(function (res) {
        svc.CheckIQXResult(res.data)  // Checks the IQXResult construct and, if failed, throws exception with the message
        return res.data // Promise succeeds - we may want the IQXResult
        })
      .catch(function (err) {
        return $q.reject(scope.formError=svc.ExtractError(err))
        })
    }

})
