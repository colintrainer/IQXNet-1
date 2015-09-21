create procedure pears.NetCandidateRegisterPreCheck(in pWebUserID char(20),in pForenames char(50),in pSurname char(50),in pemail char(250),in pGender char(20) default
null,in pdob char(20) default null,in pNINumber char(20) default null,in phomephone char(250) default null,in pDayPhone char(250) default null,in pMobile char(250) default null,in pAddr1 char(50) default
null,in pAddr2 char(50) default null,in pAddr3 char(50) default null,in pTown char(50) default null,in pCounty char(50) default null,in pCountry char(50) default null,in pPostcode char(50) default null,in qanswers long varchar default
null)
result(pResult char(250))
// IQXWeb
begin
  declare dateofbirth date;
  set dateofbirth=IQXNetStringToDate(pdob);
  if trim(isnull(pdob,'')) <> '' and dateofbirth is null then
    select '1:~Invalid date of birth';
    return
  end if;
  if dateofbirth is not null and ppostcode is not null then
    if exists(select * from person where postcode = ppostcode and dob = dateofbirth and similar(string(pforenames,' ',psurname),string(forenames,' ',surname)) >= 90) then
      select '9:~You may already be registered - please contact the agency';
      return
    end if
  end if;
  select '0:~Success'
end