angular.module('app')
.service('QuestionnaireSvc', function (ApiSvc, $q, $filter) {
  var svc=this
  
  svc.setOptions=function (scope,options) {
    scope.QuestionnaireSvcOptions=angular.extend({
      tagTarget:'',
      tagLocation:'',
      displayGroup:'',
      id:'',
      notLoggedIn:false,
      postVar:''
      },options)
    }

  function describeChoices(tag) {  // Prepare the summary description for multi-select questions
    if ('LGSQ'.indexOf(tag.tagtype)<0) {return}
    var vals=[]
    angular.forEach(tag.choices, function(choice) {
      if (tag.tagtype=='L') {
        if (choice.value) {vals.push(choice.description)}
      } else if (tag.tagtype=='S') {
        if (choice.value) {vals.push(choice.description+' '+choice.value)}
      } else if (tag.tagtype=='G') {
        if (choice.value) {
          angular.forEach(tag.subChoices, function(subChoice) {
            if (choice.value==subChoice.value) {vals.push(choice.description+' '+subChoice.description)}
            })
          }
      } else if (tag.tagtype=='Q') {
        if (choice.value) {
          angular.forEach(choice.subChoices, function(subChoice) {
            if (choice.value==subChoice.tagchoiceid) {vals.push(choice.description+' '+subChoice.description)}
            })
          }
      }
      })
    tag.value=vals.join(', ')
    }

  function dateOpen(event,tag) {  // For the date picker
    event.preventDefault()
    event.stopPropagation()
    tag.dateIsOpen = true
    }
    
  function attachTagValues(tagValues,newTag,choices,subChoices) {
    angular.forEach(tagValues, function(tagValue) {
      switch (newTag.tagtype) {
        case 'T':
        case 'U':
          newTag.value=tagValue.textvalue
          break
        case 'N':
          if (tagValue.value) {newTag.value=+tagValue.value} // make numeric
          break
        case 'D':
          if (tagValue.value) {newTag.value=moment('1899-12-30').add(tagValue.value,'days').toDate()}  // make date
          newTag.dateIsOpen=false  // datePicker popup setup
          newTag.dateOpen=function(event) {
            dateOpen(event,this)
            }
          break
        case 'M':
          newTag.value=tagValue.tagchoiceid
          break
        default:
          var done=false, parentchoiceid=''
          if (tagValue.value) {
            if (newTag.tagtype=='Q') {  // First find the parent choice which is the menu for this subchoice
              angular.forEach(subChoices,function(subChoice) {
                if (subChoice.tagchoiceid==tagValue.tagchoiceid) {parentchoiceid=subChoice.tagchoiceparentid}
                })
              }
            angular.forEach(choices,function(choice) {
              if (!done) {
                if (newTag.tagtype=='Q') {
                  if (choice.tagchoiceid==parentchoiceid) {  // This is the correct menu
                    choice.value=tagValue.tagchoiceid
                    done=true
                    }
                } else if (choice.tagchoiceid==tagValue.tagchoiceid) {
                  if (newTag.tagtype=='L') {
                    if (tagValue.value!='0') {choice.value=true}  // make boolean
                  } else if (newTag.tagtype=='S') {
                    choice.value=+tagValue.value  // make numeric
                  } else if (newTag.tagtype=='G') {
                    choice.value=tagValue.value
                  }
                  done=true
                  }
                }
              })
            }
        }
      })
    }
    
  function assembleTag(newTag,choices,subChoices,tagValues) {
    attachTagValues(tagValues,newTag,choices,subChoices)
    if (newTag.tagtype=='Q') {  // Sub-menu question: attach the relevant subChoices to each choice
      angular.forEach(choices, function(choice) {
        choice.subChoices=[{tagchoiceid:'',description:'',value:''}] // We want them to be able to blank
        angular.forEach(subChoices, function (subChoice) {
          if (subChoice.tagchoiceparentid==choice.tagchoiceid) {
            choice.subChoices.push(subChoice)
            }
          })
        })
    } else {  // Graded question subChoices - same for all choices so attached directly to the tag
      if (subChoices.length>0) {
        subChoices.unshift({tagchoiceid:'',description:'',value:''}) // We want them to be able to blank
        newTag.subChoices=subChoices
        }
      }
    if (newTag.tagtype=='M') {  // Single select
      var has_=false
      angular.forEach(choices, function(choice) {  // Discover if it has an _ choice for the default
        if (choice.tagchoiceid=='_') {has_=true}
        })
      if (has_) {
        if (!newTag.value) {newTag.value='_'} // If it has, use it for an empty value
      } else {
        choices.unshift({tagchoiceid:'',description:'',value:''})  // Otherwise add a blank choice
      }
      }
    newTag.choices=choices  // Attach the choices
    if (newTag.units) {newTag.description=newTag.description+' ('+newTag.units+')'}
    describeChoices(newTag)  // This puts the summary description for multi-selects into the tag.value, for display and change tracking
    newTag.oldValue=newTag.value  // For change detection
    angular.forEach(newTag.choices, function(choice) {
      choice.oldValue=choice.value   // For change detection
      })
    newTag.updateDescription=function() {  // This will be invoked when multi-select choices are changed, to update the tag.value
      describeChoices(this)
      this.formField.$setTouched() // So that any validation message shows
      }
    }
    
  svc.fetch=function(scope,options) {
    options = options || scope.QuestionnaireSvcOptions 
    if (!options.tagTarget || !options.tagLocation) {return $q.reject(scope.formError='Invalid QuestionnaireSvcOptions')}
    var api='callresult'+(options.notLoggedIn?'_':'')+'/NetQuestionnaire?ptaglocation='+options.tagLocation
    scope.rawQ=[]  // rawQ is the fetch target and is the intermediate dataset in building the tag structure. First ensure that it is empty.
    scope[options.tagTarget]=[]  // Also empty the tag structure
    var newTags=[]
    if (options.displayGroup) {api=api+'&pgroup='+options.displayGroup}
    if (options.id) {api=api+'&pid='+options.id}
    return ApiSvc.fetch(scope,{fetchAPI:api,fetchTarget:'rawQ',multiRow:true,notLoggedIn:options.notLoggedIn})
    .then(function() {
      //console.log(scope.rawQ)
      var lastTagID='',newTag=null,choices=[],subChoices=[],tagValues=[]
      scope.rawQ.push({tagid:'',rectype:-1})  // Null row at the end simplifies parsing
      angular.forEach(scope.rawQ, function(tag) {
        if (tag.tagid!=lastTagID) {  // Starting a new question
          lastTagID=tag.tagid
          if (newTag) {  // Save previous question and prepare to load next
            assembleTag(newTag,choices,subChoices,tagValues)  // Links choices, subchoices and values
            newTags.push(newTag)
            newTag=null
            choices=[]
            subChoices=[]
            tagValues=[]
            }
          }
        if (tag.rectype==0) {  // tag
          newTag={tagtype:tag.tagtype,
               taglocation:tag.taglocation,
               tagid:tag.tagid,
               id:encodeURIComponent(tag.tagtype+(tag.taglocation+'___').substr(0,3)+(tag.tagid+'___').substr(0,3)),  // Used as the DOM id and the data saving id
               minstep:tag.minstep,
               units:tag.units,
               required:(tag.required=='1'),
               displaygroup:tag.displaygroup,
               description:tag.description,
               value:null}
        } else if (tag.rectype==1) {  //choice
          choices.push({tagchoiceid:tag.tagchoiceid,
                            id:newTag.id+encodeURIComponent(tag.tagchoiceid),  // For DOM id
                            description:tag.description,
                            value:null})
        } else if (tag.rectype==2) {  //subchoice
          subChoices.push({tagchoiceid:tag.tagchoiceid,
                            description:tag.description,
                            value:tag.value,
                            tagchoiceparentid:tag.tagchoiceparentid})
        } else if (tag.rectype==3) {  // value
          tagValues.push({tagchoiceid:tag.tagchoiceid,
                        value:tag.value,   
                        textvalue:tag.textvalue})
        }
        })
      scope.rawQ=[]  // Clear the temporary data
      scope[options.tagTarget]=newTags  // Put the complete structure in the scope
      })
    }

  svc.reset=function(scope,options) {
    options=options || scope.QuestionnaireSvcOptions
    if (options.tagTarget) {
      angular.forEach(scope[options.tagTarget], function(tag) {
        tag.wellOpen=false  // Hide the multiselect choices
        tag.value=tag.oldValue  // Revert to fetched value
        angular.forEach(tag.choices, function(choice) {
          choice.value=choice.oldValue  // Revert to fetched value
          })
        })
      }
    }
    
  svc.answers=function(scope,options) {
    var qanswers=[],chID,chVal
    options=options || scope.QuestionnaireSvcOptions
    if (options.tagTarget) {
      angular.forEach(scope[options.tagTarget], function(tag) {
        tag.wellOpen=false  // Hide the multiselect choices so that any validation errors are easier to see
        if(!ApiSvc.ValuesAreEqual(tag.value,tag.oldValue)) {
          switch (tag.tagtype) {
            case 'T':
            case 'U':
            case 'N':
            case 'M':
              qanswers.push(tag.id+'='+encodeURIComponent(tag.value))
              break
            case 'D':
              qanswers.push(tag.id+'='+encodeURIComponent($filter('date')(tag.value, 'dd/MM/yyyy')))
              break
            default:
              if (tag.value) {
                angular.forEach(tag.choices, function(choice) {
                  if (choice.value) {
                    switch(tag.tagtype) {
                      case 'L':
                        chID=choice.tagchoiceid
                        chVal=1
                        break
                      case 'G':
                      case 'S':
                        chID=choice.tagchoiceid
                        chVal=choice.value
                        break
                      default:  // 'Q'
                        chID=choice.value
                        chVal=1
                      }
                      qanswers.push(tag.id+encodeURIComponent(chID)+'='+chVal)
                    }
                  })
              } else { // No selections in a multiselect
                qanswers.push(tag.id+'=')  // Blank return required to clear the answers 
              }
            }
          }
        })
      }
    return qanswers.join('&')
    }

  svc.linkFormFields=function(scope,options) {  // Links the tag to the form structure so that error messaging can be plumbed in
    options=options || scope.QuestionnaireSvcOptions
    if (options.tagTarget) {
      angular.forEach(scope[options.tagTarget], function(tag) {
        tag.formField=scope.theForm[tag.id]
        })
      }
    }
    
})
