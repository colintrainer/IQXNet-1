create procedure pears.NetProvTimesheetRateSet(in pWebUserID char(20),in pTempProvTimesheetLineID char(250),in pUnitDescription char(250) default null,in pUnits char(250) default null,in pRate char(250) default null)
result(pResult char(250))
// IQXWeb
begin
  declare i smallint;
  declare isnewline smallint;
  declare newlineid char(20);
  declare ptempprovtimesheetid char(20);
  declare userClass char(20);
  declare divid char(20);
  declare local temporary table IDs(
    ID char(20) null,
    ) not transactional;
  if pTempProvTimesheetLineID like 'Copy%' then
    set isnewline=1
  else
    set isnewline=0
  end if;
  set i=charindex('_',pTempProvTimesheetLineID);
  if i > 0 then
    set pTempProvTimesheetLineID="right"(pTempProvTimesheetLineID,length(pTempProvTimesheetLineID)-i)
  end if;
  set ptempprovtimesheetid=(select first tempprovtimesheetid from tempprovtimesheetline where tempprovtimesheetlineid = pTempProvTimesheetLineID);
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
  if isnewline = 1 then
    set newlineid=uniquekey(pTempProvTimesheetLineID);
    insert into tempprovtimesheetline( tempprovtimesheetlineid,tempprovtimesheetid,temppaybandid,linenumber,unitspaid,unitscharged,payrate,chargerate,
      description) select newlineid,ptempprovtimesheetid,temppaybandid,
        isnull((select 1+max(linenumber) from tempprovtimesheetline where tempprovtimesheetid = ptempprovtimesheetid),1),
        isnull(punits,unitspaid),isnull(punits,unitscharged),isnull(prate,payrate),isnull(prate,chargerate),
        isnull(punitdescription,nullif(trim(description),''),'Units Edited') from tempprovtimesheetline where tempprovtimesheetlineid = ptempprovtimesheetlineid
  else
    update tempprovtimesheetline set unitspaid = isnull(punits,unitspaid),unitscharged = isnull(punits,unitscharged),payrate = isnull(prate,payrate),chargerate = isnull(prate,chargerate),
      description = isnull(punitdescription,nullif(trim(description),''),'Units Edited') where tempprovtimesheetlineid = pTempProvTimesheetLineID
  end if;
  select '0:~Success'
end