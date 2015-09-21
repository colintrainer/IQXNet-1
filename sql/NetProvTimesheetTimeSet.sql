create procedure pears.NetProvTimesheetTimeSet(in pWebUserID char(20),in pplacementid_date char(250),in phours char(250) default null,in ptimefrom char(250) default null)
result(pResult char(250))
// IQXWeb
begin
  declare i smallint;
  declare pplacementid char(20);
  declare pdate date;
  declare pptime time;
  declare pphours double;
  declare pcancelled tinyint;
  declare userClass char(20);
  declare divid char(20);
  declare local temporary table IDs(
    ID char(20) null,
    ) not transactional;
  set i=locate(pplacementid_date,'_',-1);
  if i > 0 then
    set pdate=iqxnetstringtodate("right"(pplacementid_date,length(pplacementid_date)-i));
    set pplacementid="left"(pplacementid_date,i-1)
  else
    select '101:~Invalid data';
    return
  end if;
  set pphours=nullif(iqxnetstringtodouble(phours),0.0);
  if pphours is null then
    set pptime=null;
    set pcancelled=1
  else
    set pptime=iqxnetstringtotime(ptimefrom);
    set pcancelled=0
  end if;
  set userClass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);
  if userClass = 'OWNER' then
    insert into IDs( ID) 
      select distinct s.divisionid from iqxnetuser as i key join staff as s where i.iqxnetuserid = pwebuserid;
    if not pplacementid = any(select first pl.placementid from placement as pl key join employment key join person as pe join IDs on pe.divisionid = IDs.ID) then
      select '99:~Permission denied';
      return
    end if
  else
    if not pplacementid = any(
      select p.placementid from placement as p key join employment key join person key join iqxnetuserlink where iqxnetuserid = pwebuserid union
      select p.placementid from placement as p key join employment key join person key join pay_employee key join company as agcomp key join employment as agemp key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid union
      select p.placementid from placement as p key join vacancy key join employment as vacemp key join company key join employment key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid) then
      select '99:~Permission denied';
      return
    end if
  end if;
  delete from placementdayvariation where placementid = pplacementid and variationdate = pdate;
  insert into placementdayvariation( placementid,variationdate,workstarttime,workhours,workcancelled) values( pplacementid,pdate,pptime,pphours,pcancelled) ;
  select '0:~Success'
end