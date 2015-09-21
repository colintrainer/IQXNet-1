create procedure pears.NetProvTimesheetShiftsSelect(in pWebUserID char(20),in pTempProvTimesheetID char(20),in pShiftList long varchar)
result(pResult char(250))
// IQXWeb
begin
  declare i smallint;
  declare dummy smallint;
  declare s char(30);
  declare userClass char(20);
  declare divid char(20);
  declare local temporary table IDs(
    ID char(20) null,
    ) not transactional;
  set userClass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);
  if userClass = 'OWNER' then
    insert into IDs( ID) 
      select distinct s.divisionid from iqxnetuser as i key join staff as s where i.iqxnetuserid = pwebuserid;
    if not ptempprovtimesheetid = any(select first t.tempprovtimesheetid from tempprovtimesheet as t key join person as p join IDs on p.divisionid = IDs.ID) then
      select '99:~Permission denied';
      return
    end if
  else
    if not pTempProvTimesheetID = any(
      select t.TempProvTimesheetID from tempprovtimesheet as t key join person key join iqxnetuserlink where iqxnetuserid = pwebuserid union
      select t.TempProvTimesheetID from tempprovtimesheet as t key join person key join pay_employee key join company as agcomp key join employment as agemp key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid union
      select t.TempProvTimesheetID from tempprovtimesheet as t key join vacancy key join employment as vacemp key join company key join employment key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid) then
      select '99:~Permission denied';
      return
    end if
  end if;
  delete from tempprovtimesheetshift where tempprovtimesheetid = pTempprovtimesheetid;
  set pShiftList=replace(pShiftList,'Shift_','');
  looplabel: loop
    set i=charindex(',',pShiftList);
    if i = 0 then
      set s=pshiftlist
    else
      set s="left"(pshiftlist,i-1);
      set pshiftlist="right"(pshiftlist,length(pshiftlist)-i)
    end if;
    set s=trim(s);
    if s <> '' then
      begin
        insert into tempprovtimesheetshift( tempprovtimesheetid,tempshiftid) values( ptempprovtimesheetid,s) 
      exception
        when others then
          set dummy=0
      end
    end if;
    if i = 0 then
      leave looplabel
    end if
  end loop looplabel;
  select '0:~Success'
end