create PROCEDURE pears."NetCandidateProfile"(in pWebUserID char(20))
result(PersonID char(20),Forenames char(50),Surname char(50),Gender char(1),DOB date,HomePhone char(250),DayPhone char(250),Mobile char(250),Email char(250),Addr1 char(50),Addr2 char(50),Addr3 char(50),Town char(50),County char(50),Country char(50),Postcode char(50))
begin  
  select first person.personid,person.forenames,person.surname,person.sex,person.dob,
    getphone('P','Home Telephone',person.personid) as HomePhone,getphone('P','Day Telephone',person.personid) as DayPhone,
    getphone('P','Mobile',person.personid) as Mobile,getphone('P','E-mail',person.personid) as Email,
    person.addr1,person.addr2,person.addr3,person.town,person.county,person.country,person.postcode
    from person key join iqxnetuserlink key join iqxnetuser where iqxnetuser.iqxnetuserid = pWebUserID
end