create procedure pears.NetAgencyCandidateAdd(in pWebUserID char(20),in pForeNames char(50),in pSurname char(50),in pReference char(50))
result(pResult char(250))
begin
  declare @PersID char(20);
  declare @SecAgID char(20);
  if IQXNetHasPermission(pWebUserID,'ADDCANDIDATES') = 0 then
    select '99:~Permission denied';
    return
  end if;
  set @SecAgID=(select first employment.companyid from employment key join iqxnetuserlink where iqxnetuserlink.iqxnetuserid = pwebuserid);
  set @PersID=uniquekey(pforenames+psurname);
  insert into person( personid,staffid,name,keyname,forenames,surname,salutation,status) values( @persid,userstaffid,string(pforenames,' ',psurname),
    makekeyname(string(psurname,' ',pforenames)),pforenames,psurname,pforenames,'A') ;
  insert into pay_employee( personid,secondaryagencyid,secondaryagencyref) values( @persid,@secagid,ucase(pReference)) ;
  select '0:~Success'
end