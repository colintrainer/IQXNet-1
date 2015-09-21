create PROCEDURE pears."NetTimesheet"(in pWebUserID char(20),in pTempTimesheetID char(20))
result(temptimesheetid char(20),serialnumber char(20),timesheettype char(1),tempname char(60),position char(60),companyname char(60),weekenddate date,completedby char(50),completedat datetime)
// IQXWeb
begin
  select t.temptimesheetid,t.serialnumber,
    if tempdesk.desktype = 'S' then 'S' else if tempdesk.desktype = 'W'
        and exists(select * from placement where placementid = t.placementid and worknormalhours is not null and workstarttime is not null
        and(isnull(workmonday,0) = 1 or isnull(worktuesday,0) = 1 or isnull(workwednesday,0) = 1 or isnull(workthursday,0) = 1 or isnull(workfriday,0) = 1
        or isnull(worksaturday,0) = 1 or isnull(worksunday,0) = 1)) then 'T'
    else 'C'
    endif
    endif as timesheettype,
    string(person.surname,', ',person.forenames) as tempname,
    vacancy.position,company.name as companyname,weekmonthenddate(t.period,t.periodlength) as weekenddate,
    (select first i.name from tempprovtimesheethistory as h join iqxnetuser as i on h.externaluserid = i.iqxnetuserid
      where h.temptimesheetid = t.temptimesheetid and h.newstatus = 100) as completedby,
    t.whenentered as completedat
    from temptimesheet as t key join placement key join vacancy key join employment key join company
    ,temptimesheet as t key join tempdesk
    ,temptimesheet as t key join person
    where t.temptimesheetid = ptemptimesheetid and nethaspermission(pWebUserID,person.personid,company.companyid)=1
end