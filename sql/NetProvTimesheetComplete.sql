create procedure pears.NetProvTimesheetComplete(in pWebUserID char(20),in ptempprovtimesheetid char(20),in pInstruction char(20) default null)
result(pResult char(250))
// IQXWeb
begin
  declare oldstat smallint;
  declare newstat smallint;
  declare statdesc char(30);
  declare userClass char(20);
  declare divid char(20);
  declare local temporary table IDs(
    ID char(20) null,
    ) not transactional;
  set userClass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);
  if userClass = 'OWNER' then
    insert into IDs( ID) 
      select distinct s.divisionid from iqxnetuser as i key join staff as s where i.iqxnetuserid = pwebuserid;
    if not ptempprovtimesheetid = any(select t.tempprovtimesheetid from tempprovtimesheet as t key join person as p join IDs on p.divisionid = IDs.ID) then
      select '99:~Permission denied';
      return
    end if
  else
    if not ptempprovtimesheetid = any(select t.tempprovtimesheetid
        from tempprovtimesheet as t key join person key join pay_employee key join company as agcomp key join employment as agemp key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid union
      select t.tempprovtimesheetid
        from tempprovtimesheet as t key join person key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid union
      select t.tempprovtimesheetid from tempprovtimesheet as t key join vacancy key join employment as vacemp key join company key join employment key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid) then
      select '99:~Permission denied';
      return
    end if
  end if;
  if ucase(isnull(pInstruction,'')) = 'REVERSE' then
    set newstat=1;
    set oldstat=2;
    set statdesc='Timesheet Un-filled'
  else
    set newstat=2;
    set oldstat=1;
    set statdesc='Timesheet Filled'
  end if;
  update tempprovtimesheet set extnumber = newstat where tempprovtimesheetid = ptempprovtimesheetid;
  if @@rowcount = 1 then
    insert into tempprovtimesheethistory( tempprovtimesheethistoryid,tempprovtimesheetid,serialnumber,description,oldstatus,newstatus,staffid,whenentered,externaluserid) 
      select uniquekey(ptempprovtimesheetid),ptempprovtimesheetid,serialnumber,statdesc,oldstat,newstat,userstaffid,current timestamp,pwebuserid from tempprovtimesheet where tempprovtimesheetid = ptempprovtimesheetid;
    select '0:~Success'
  else
    select '98:~Timesheet already finalised or deleted'
  end if
end