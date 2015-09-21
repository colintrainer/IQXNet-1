create procedure pears.NetProvTimesheetSetTheirRef(in pWebUserID char(20),in ptempprovtimesheetid char(20),in pTheirRef char(100) default null)
result(pResult char(250))
// IQXWeb
begin
  if not ptempprovtimesheetid
     = any(select t.tempprovtimesheetid from tempprovtimesheet as t key join vacancy key join employment as vacemp key join company key join employment key join iqxnetuserlink
      where iqxnetuserlink.iqxnetuserid = pwebuserid) then
    select '99:~Permission denied';
    return
  end if;
  update tempprovtimesheet set theirref = ucase(ptheirref) where tempprovtimesheetid = ptempprovtimesheetid;
  select '0:~Success'
end