create procedure pears.NetProvTimesheet( in pWebUserID char(20),in pTempProvTimesheetID char(20) ) 
result( tempprovtimesheetid char(20),serialnumber char(20),tempname char(60),position char(60),companyname char(60),companyaddress char(120),weekenddate date,timesheettype char(1),completed smallint,theirref char(100),theirrefrequired smallint,completedby char(50),completedat char(20) ) 
// IQXWeb
begin
  select t.tempprovtimesheetid,t.serialnumber,string(person.surname,', ',person.forenames) as tempname,vacancy.position,
    company.name as companyname,getcompanyaddressonline(company.companyid) as companyaddress,
    NetTimesheetEndDate(1,1,t.tempprovtimesheetid) as weekenddate,
    if NetVacancyHasRateScript(t.tempjobtypeid,t.vacancyid) = 0 then 'C'
    else if tempdesk.desktype = 'S' then 'S' else if tempdesk.desktype = 'W'
        and exists(select * from placement where placementid = t.placementid and worknormalhours is not null and workstarttime is not null
          and(isnull(workmonday,0) = 1 or isnull(worktuesday,0) = 1 or isnull(workwednesday,0) = 1 or isnull(workthursday,0) = 1 or isnull(workfriday,0) = 1
          or isnull(worksaturday,0) = 1 or isnull(worksunday,0) = 1)) then 'T'
        else 'C'
        endif endif
    endif as timesheettype,
    if t.extnumber = 2 then 1 else 0 endif as completed,
    isnull(t.theirref,GetPlacementTheirRef(person.personid,vacancy.vacancyid)) as theirref,
    companyaccount.theirrefrequired,
    (select first i.name from tempprovtimesheethistory as h join iqxnetuser as i on h.externaluserid = i.iqxnetuserid
      where h.tempprovtimesheetid = t.tempprovtimesheetid and h.newstatus = 100) as completedby,'' as completedat
    from tempprovtimesheet as t key join vacancy key join employment key join company
      ,tempprovtimesheet as t key join tempdesk
      ,tempprovtimesheet as t key join person
      ,company key left outer join companyaccount
    where t.tempprovtimesheetid = ptempprovtimesheetid and nethaspermission(pWebUserID,person.personid,company.companyid) = 1 and t.extnumber > 0
end