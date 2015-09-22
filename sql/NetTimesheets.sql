create PROCEDURE pears."NetTimesheets"(in pWebUserID char(20),in pSlice integer default 0,in pSliceSize integer default 20)
result(temptimesheetid char(20),serialnumber char(20),tempname char(60),position char(60),companyname char(60),weekenddate date,timesheettype char(1),timesheettotal double,companyaddress char(250),theirref char(50))
// IQXWeb
begin
  declare userClass char(20);
  declare x integer;
  declare y integer;
  set x=pSliceSize;
  set y=x*pSlice+1;
  set userClass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);
  if userClass = 'CANDIDATE' then
    select top x start at y t.temptimesheetid,t.serialnumber,string(person.surname,', ',person.forenames) as tempname,vacancy.position,company.name as companyname,weekmonthenddate(t.period,t.periodlength) as weekenddate,
      if tempdesk.desktype = 'S' then 'S' else if tempdesk.desktype = 'W'
      and exists(select * from placement where placementid = t.placementid and worknormalhours is not null and workstarttime is not null
        and(isnull(workmonday,0) = 1 or isnull(worktuesday,0) = 1 or isnull(workwednesday,0) = 1 or isnull(workthursday,0) = 1 or isnull(workfriday,0) = 1
        or isnull(worksaturday,0) = 1 or isnull(worksunday,0) = 1)) then 'T'
      else 'C'
      endif
      endif as timesheettype,(select sum(unitspaid*payrate) from temptimesheetline where temptimesheetid = t.temptimesheetid) as timesheettotal,'' as CompanyAddress,
      t.theirref
      from temptimesheet as t key join placement key join vacancy key join employment key join company
      ,temptimesheet as t key join tempdesk
      ,temptimesheet as t key join person key join iqxnetuserlink
      where iqxnetuserlink.iqxnetuserid = pwebuserid order by
      t.serialnumber desc
  else if userClass = 'AGENCY' then
      select top x start at y t.temptimesheetid,t.serialnumber,string(person.surname,', ',person.forenames) as tempname,vacancy.position,company.name as companyname,weekmonthenddate(t.period,t.periodlength) as weekenddate,
        if tempdesk.desktype = 'S' then 'S' else if tempdesk.desktype = 'W'
        and exists(select * from placement where placementid = t.placementid and worknormalhours is not null and workstarttime is not null
          and(isnull(workmonday,0) = 1 or isnull(worktuesday,0) = 1 or isnull(workwednesday,0) = 1 or isnull(workthursday,0) = 1 or isnull(workfriday,0) = 1
          or isnull(worksaturday,0) = 1 or isnull(worksunday,0) = 1)) then 'T'
        else 'C'
        endif
        endif as timesheettype,(select sum(unitspaid*payrate) from temptimesheetline where temptimesheetid = t.temptimesheetid) as timesheettotal,'' as CompanyAddress,
        t.theirref
        from temptimesheet as t key join placement key join vacancy key join employment key join company
        ,temptimesheet as t key join tempdesk
        ,temptimesheet as t key join person key join pay_employee key join company as agcomp key join employment as agemp key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid and weekenddate >= IQXNetCompanyStartDate(agcomp.companyid) order by
        t.serialnumber desc
    else if userClass = 'OWNER' then
        set divid=(select first staff.divisionid from iqxnetuser key join staff where iqxnetuser.iqxnetuserid = pwebuserid);
        select top x start at y t.temptimesheetid,t.serialnumber,string(person.surname,', ',person.forenames) as tempname,vacancy.position,company.name as companyname,weekmonthenddate(t.period,t.periodlength) as weekenddate,
          if tempdesk.desktype = 'S' then 'S' else if tempdesk.desktype = 'W'
          and exists(select * from placement where placementid = t.placementid and worknormalhours is not null and workstarttime is not null
            and(isnull(workmonday,0) = 1 or isnull(worktuesday,0) = 1 or isnull(workwednesday,0) = 1 or isnull(workthursday,0) = 1 or isnull(workfriday,0) = 1
            or isnull(worksaturday,0) = 1 or isnull(worksunday,0) = 1)) then 'T'
          else 'C'
          endif
          endif as timesheettype,(select sum(unitspaid*payrate) from temptimesheetline where temptimesheetid = t.temptimesheetid) as timesheettotal,'' as CompanyAddress,
          t.theirref
          from temptimesheet as t key join placement key join vacancy key join employment key join company
          ,temptimesheet as t key join tempdesk
          ,temptimesheet as t key join person
          where company.divisionid = divid and person.divisionid = divid order by
          t.serialnumber desc
    else -- CLIENT
        set @companycount=(select count(*) from iqxnetuserlink where iqxnetuserid = pWebUserID);
      select top x start at y t.temptimesheetid,t.serialnumber,string(person.surname,', ',person.forenames) as tempname,vacancy.position,company.name as companyname,weekmonthenddate(t.period,t.periodlength) as weekenddate,
        if tempdesk.desktype = 'S' then 'S' else if tempdesk.desktype = 'W'
        and exists(select * from placement where placementid = t.placementid and worknormalhours is not null and workstarttime is not null
          and(isnull(workmonday,0) = 1 or isnull(worktuesday,0) = 1 or isnull(workwednesday,0) = 1 or isnull(workthursday,0) = 1 or isnull(workfriday,0) = 1
          or isnull(worksaturday,0) = 1 or isnull(worksunday,0) = 1)) then 'T'
        else 'C'
        endif
          endif as timesheettype,(select sum(unitscharged*chargerate) from temptimesheetline where temptimesheetid = t.temptimesheetid) as timesheettotal,
          (if @companycount > 1 then GetCompanyAddressOnLine(company.companyid)
          else ''
          endif) as CompanyAddress,t.theirref
        from temptimesheet as t key join placement key join vacancy key join employment key join company key join employment as allemps key join iqxnetuserlink
        ,temptimesheet as t key join tempdesk
        ,temptimesheet as t key join person
        where iqxnetuserlink.iqxnetuserid = pwebuserid and weekenddate >= IQXNetCompanyStartDate(company.companyid) order by
        t.serialnumber desc
      end if
    end if
  end if
end