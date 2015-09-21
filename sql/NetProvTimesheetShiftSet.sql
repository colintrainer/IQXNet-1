create procedure pears.NetProvTimesheetShiftSet(in pWebUserID char(20),in ptempshiftid char(250),in pshiftdate char(250) default 'NOT_SET',in ptimefrom char(250) default 'NOT_SET',in ptimeto char(250) default 'NOT_SET',in pbreakminutes char(250) default 'NOT_SET')
result(pResult char(250))
// IQXWeb
begin
  declare i smallint;
  declare isnewshift smallint;
  declare newshiftid char(20);
  declare userClass char(20);
  declare divid char(20);
  declare local temporary table IDs(
    ID char(20) null,
    ) not transactional;
  if trim(pbreakminutes) = '' then
    set pbreakminutes='0'
  end if;
  if ptempshiftid like 'Copy%' then
    set isnewshift=1
  else
    set isnewshift=0
  end if;
  set i=charindex('_',ptempshiftid);
  if i > 0 then
    set ptempshiftid="right"(ptempshiftid,length(ptempshiftid)-i)
  end if;
  set userClass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);
  if userClass = 'OWNER' then
    insert into IDs( ID) 
      select distinct s.divisionid from iqxnetuser as i key join staff as s where i.iqxnetuserid = pwebuserid;
    if not ptempshiftid = any(select s.tempshiftid from tempshift as s key join person as p join IDs on p.divisionid = IDs.ID) then
      select '99:~Permission denied';
      return
    end if
  else
    if not pTempShiftID = any(
      select t.TempShiftID from tempshift as t key join person key join iqxnetuserlink where iqxnetuserid = pwebuserid union
      select t.TempShiftID from tempshift as t key join person key join pay_employee key join company as agcomp key join employment as agemp key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid union
      select t.TempShiftID from tempshift as t key join vacancy key join employment as vacemp key join company key join employment key join iqxnetuserlink
        where iqxnetuserlink.iqxnetuserid = pwebuserid) then
      select '99:~Permission denied';
      return
    end if
  end if;
  if isnewshift = 1 then
    set newshiftid=uniquekey(ptempshiftid);
    insert into tempshiftplan( TempShiftPlanID,VacancyID,ShiftDate,TimeFrom,TimeTo,BreakMinutes,Description,EssentialSkill,EssentialSkillGradeID,ReferenceCode,
      EssentialSkillChoiceList,TempShiftTypeID,AnalysisCode,RecoveryHours) 
      select newshiftid,VacancyID,isnull(iqxnetstringtodate(pshiftdate),shiftdate),isnull(iqxnetstringtotime(ptimefrom),timefrom),
        isnull(iqxnetstringtotime(ptimeto),timeto),isnull(iqxnetstringtointeger(pbreakminutes),breakminutes),Description,EssentialSkill,EssentialSkillGradeID,'Self-booked',
        EssentialSkillChoiceList,TempShiftTypeID,AnalysisCode,RecoveryHours from tempshiftplan
        where tempshiftplanid = (select tempshiftplanid from tempshift where tempshiftid = ptempshiftid);
    insert into tempshift( TempShiftID,VacancyID,PersonID,PlacementID,ShiftDate,TimeFrom,TimeTo,BreakMinutes,State,TempShiftPlanID,EssentialSkillGradeID,ReferenceCode,
      ClientConfirmed,TempConfirmed,TempShiftTypeID,AnalysisCode,RecoveryHours) 
      select NewShiftID,VacancyID,PersonID,PlacementID,isnull(iqxnetstringtodate(pshiftdate),shiftdate),isnull(iqxnetstringtotime(ptimefrom),timefrom),
        isnull(iqxnetstringtotime(ptimeto),timeto),isnull(iqxnetstringtointeger(pbreakminutes),breakminutes),'B',NewShiftID,EssentialSkillGradeID,'Self-booked',
        1,1,TempShiftTypeID,AnalysisCode,RecoveryHours from tempshift
        where tempshiftid = ptempshiftid
  else
    update tempshift set shiftdate = isnull(iqxnetstringtodate(pshiftdate),shiftdate),timefrom = isnull(iqxnetstringtotime(ptimefrom),timefrom),
      timeto = isnull(iqxnetstringtotime(ptimeto),timeto),breakminutes = isnull(iqxnetstringtointeger(pbreakminutes),breakminutes)
      where tempshiftid = ptempshiftid
  end if;
  select '0:~Success'
end