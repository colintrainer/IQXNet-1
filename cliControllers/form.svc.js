angular.module('app')
.service('FormSvc', function (ApiSvc, $q, $timeout, ApplicationSvc, QuestionnaireSvc) {
	var svc=this

  svc.setOptions=function (scope,options) {
    scope.FormSvcOptions=angular.extend({
      fetchAPI:'',
      fetchTarget:'',
      saveAPI:'',
      savePrefix:'',
      dateFields:[],
      booleanFields:[],
      primaryKey:'',
      multiRow:false,
      notLoggedIn:false,
      autoEdit:false,
      saveCleanFields:false,
      questionnaire:null
      },options)

    // Date picker setup
    scope.dateFormat='dd/MM/yyyy'  
    scope.dateOptions={}
    scope.dateIsOpen={}
    scope.dateOpen = function(event,sID) {
      event.preventDefault()
      event.stopPropagation()
      scope.dateIsOpen[sID] = true
      }
      
    scope.autoEdit=scope.FormSvcOptions.autoEdit
    ApplicationSvc.autoEdit=scope.FormSvcOptions.autoEdit
    
    // Attach the key functions to the scope for easy use by the form
    scope.update=function () {
      return svc.update(scope)
	    }
     
    scope.reset=function () {
      return svc.reset(scope)
      }

    scope.fetch=function (options) {
      return svc.fetch(scope,options)
      }
      
    scope.exec=function (api,postObject) {
      return ApiSvc.exec(scope,api,postObject,scope.FormSvcOptions.notLoggedIn)
	    }
      
    scope.setEditing=function (bOn) {
      svc.setEditing(scope,bOn)
      }

    scope.setSubmitted=function (bOn) {
      svc.setSubmitted(scope,bOn)
      }
      
    if (scope.FormSvcOptions.questionnaire) {
      scope.FormSvcOptions.questionnaire.notLoggedIn=scope.FormSvcOptions.notLoggedIn
      QuestionnaireSvc.setOptions(scope,scope.FormSvcOptions.questionnaire)
      }

    }
    
  svc.setEditing=function (scope,bOn) {
    if (bOn === undefined) {bOn=true}
    scope.isEditing=bOn
    ApplicationSvc.isEditing=bOn
    scope.$broadcast('isEditing',bOn)
    if (bOn && scope.QuestionnaireSvcOptions) {
      QuestionnaireSvc.linkFormFields(scope)
      }
    }

  svc.setSubmitted=function (scope,bOn) {
    if (bOn === undefined) {bOn=true}
    scope.isSubmitted=bOn
    scope.$broadcast('isSubmitted',bOn)
    }
      
  svc.update=function (scope, bSaveOnly) {
      if (!scope.isEditing) {return $q.when()}  // Returns a resolved promise so that it can be 'then'ed
      if (!scope.FormSvcOptions.saveAPI) {return $q.reject(scope.formError='No saveAPI in form service options')}
      svc.setSubmitted(scope,true)
      if (scope.theForm.$valid) {
        var changes=false
        var postvars={}
        angular.forEach(scope.theRecord, function (value,key) {
          if (scope.FormSvcOptions.saveCleanFields || key == scope.FormSvcOptions.primaryKey || !ApiSvc.ValuesAreEqual(value,scope.cleanRecord[key])) {
            postvars[scope.FormSvcOptions.savePrefix + key]=value
            if (key != scope.FormSvcOptions.primaryKey) {changes=true}
            }
          })
        if (scope.QuestionnaireSvcOptions) {
          var qanswers=QuestionnaireSvc.answers(scope)
          if (qanswers) {
            if (!scope.QuestionnaireSvcOptions.postVar) {return $q.reject(scope.formError='No postVar in questionnaire service options')}
            postvars[scope.QuestionnaireSvcOptions.postVar]=qanswers
            changes=true
            }
          }
        if (!changes) {
          if (bSaveOnly) {return $q.when()}
          return svc.fetch(scope)
          }
        return ApiSvc.exec(scope,scope.FormSvcOptions.saveAPI,postvars,scope.FormSvcOptions.notLoggedIn)
          .then(function (res) {
            if (bSaveOnly) {return $q.when(res)} // In this case only we pass out the IQXResult from the exec
            return svc.fetch(scope)
            })
      } else {
        return $q.reject(scope.formError='There are invalid values on the form')
        }
	   }
     
  svc.reset=function(scope) {
    if (scope.cleanRecord) {
      scope.theRecord=angular.copy(scope.cleanRecord)
      }
    if (scope.QuestionnaireSvcOptions) {
      QuestionnaireSvc.reset(scope)
      }
    if (scope.theForm != undefined)  {
      scope.theForm.$setPristine()
      scope.theForm.$setUntouched()
      }
    svc.setEditing(scope,false)
    svc.setSubmitted(scope,false)
	  scope.formError=''
    }

	svc.fetch=function (scope,options) {
    var theResult
    options = options || scope.FormSvcOptions 
    if (scope.theForm != undefined)  {
      scope.theForm.$setPristine()
      scope.theForm.$setUntouched()
      } 
    svc.setEditing(scope,false)
    svc.setSubmitted(scope,false)
	  scope.formError=''
    return ApiSvc.fetch(scope,options)
      .then(function () {
        if (scope.theRecord) {
          scope.cleanRecord=angular.copy(scope.theRecord)
          } // Note: The questionnaire service handles its own clean record storage
				})
      .then(function () {
        if (scope.QuestionnaireSvcOptions) {
          return QuestionnaireSvc.fetch(scope)
          }
				})
      .then(function () {
        if (options.autoEdit) {
          return $timeout(scope.setEditing,0,true,true)  // Wrap in timeout to ensure DOM is built and ready first
          }
        })
		}
    
  svc.unSpliceSelectList=function(sList) {
    var ar=sList.split(/\]\~\[/)
    var rv=[],d,v
    while (ar.length>1) {
      d=ar.shift()
      v=ar.shift()
      rv.push({Descrip:d,Value:v})
      }
    return rv
    }
    

})
