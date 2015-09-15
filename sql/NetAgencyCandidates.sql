create procedure pears.NetAgencyCandidates( in pWebUserID char(20) ) 
result( PersonID char(20),CandidateName char(100),CandidateReference char(100) ) 
begin
  declare @SecAgID char(20);
  set @SecAgID = (select first employment.companyid from employment key join iqxnetuserlink where iqxnetuserlink.iqxnetuserid = pwebuserid);
  select person.personid,
    person.name,
    pay_employee.secondaryagencyref
    from person key join pay_employee
    where pay_employee.secondaryagencyid = @secagid
    order by person.keyname asc
end