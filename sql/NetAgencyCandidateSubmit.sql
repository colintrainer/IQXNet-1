create procedure pears.NetAgencyCandidateSubmit( in pWebUserID char(20),in pPersonID char(20),in pVacancyID char(20) default null,in pShiftPlanID char(20) default null ) 
result( pResult char(250) ) 
begin 
  declare @SecAgID char(20);
  declare @sname char(100);
  if IQXNetHasPermission(pWebUserID,'SUBMITCANDIDATES') = 0 then
    select '99:~Permission denied';
    return
  end if;
  set @SecAgID = (select first employment.companyid from employment key join iqxnetuserlink where iqxnetuserlink.iqxnetuserid = pwebuserid);
  if trim(isnull(pShiftPlanID,'')) <> '' then
    if not pshiftplanid = any(select tempshiftplanid from cascadedshift where secondaryagencyid = @secagid) then
      select '99:~Permission denied';
      return
    end if;
    insert into tempshiftprogress( tempshiftprogressid,tempshiftplanid,personid,staffid,status ) values( uniquekey(ppersonid+pshiftplanid),pshiftplanid,ppersonid,userstaffid,'A' ) 
  else
    if not pvacancyid = any(select vacancyid from cascadedvacancy where secondaryagencyid = @secagid) then
      select '99:~Permission denied';
      return
    end if;
    insert into progress( progressid,vacancyid,personid,staffid,status,actiondate ) values( uniquekey(ppersonid+pvacancyid),pvacancyid,ppersonid,userstaffid,'A',current date ) 
  end if;
  set @sname = (select first name from person where personid = ppersonid);
  call IQXNetPopup(pWebUserID,null,null,pvacancyid,null,null,null,'Secondary Agency candidate submitted',@sname);
  select '0:~Success'
end