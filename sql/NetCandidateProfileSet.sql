create procedure "pears"."NetCandidateProfileSet"( in "pWebUserID" char(20),in "ppersonid" char(20),in "pForenames" char(50) default 'NOT-SET',in "pSurname" char(50) default 'NOT-SET',in "pGender" char(20) default 'NOT-SET',in "pdob" char(20) default 'NOT-SET',in "phomephone" char(250) default 'NOT-SET',in "pDayPhone" char(250) default 'NOT-SET',in "pMobile" char(250) default 'NOT-SET',in "pemail" char(250) default 'NOT-SET',in "pAddr1" char(50) default 'NOT-SET',in "pAddr2" char(50) default 'NOT-SET',in "pAddr3" char(50) default 'NOT-SET',in "pTown" char(50) default 'NOT-SET',in "pCounty" char(50) default 'NOT-SET',in "pCountry" char(50) default 'NOT-SET',in "pPostcode" char(50) default 'NOT-SET',in "pOLDForenames" char(50) default 'NOT-SET',in "pOLDSurname" char(50) default 'NOT-SET',in "pOLDGender" char(20) default 'NOT-SET',in "pOLDdob" char(20) default 'NOT-SET',in "pOLDhomephone" char(250) default 'NOT-SET',in "pOLDDayPhone" char(250) default 'NOT-SET',in "pOLDMobile" char(250) default 'NOT-SET',in "pOLDemail" char(250) default 'NOT-SET',in "pOLDAddr1" char(50) default 'NOT-SET',in "pOLDAddr2" char(50) default 'NOT-SET',in "pOLDAddr3" char(50) default 'NOT-SET',in "pOLDTown" char(50) default 'NOT-SET',in "pOLDCounty" char(50) default 'NOT-SET',in "pOLDCountry" char(50) default 'NOT-SET',in "pOLDPostcode" char(50) default 'NOT-SET',
  in "qanswers" long varchar default null ) 
result( "pResult" char(250) ) 
begin
  declare "dateofbirth" date;
  declare "bnamechanged" smallint;
  declare "ssql" char(255);
  set "bnamechanged" = 0;
  set "ssql" = '';
  if not "ppersonid" = any(select "personid" from "iqxnetuserlink" where "iqxnetuserid" = "pwebuserid") then
    select '99:~Permission denied';
    return
  end if;
  if "isnull"("pforenames",'') <> "isnull"("poldforenames",'') then
    set "ssql" = "ssql"+',forenames=pforenames';
    set "ssql" = "ssql"+',salutation=getword(pforenames,1)';
    set "bnamechanged" = 1
  end if;
  if "isnull"("psurname",'') <> "isnull"("poldsurname",'') then
    set "ssql" = "ssql"+',surname=psurname';
    set "bnamechanged" = 1
  end if;
  if "bnamechanged" = 1 then
    set "ssql" = "ssql"+',name=string(getword(pforenames,1),'' '',psurname)';
    set "ssql" = "ssql"+',keyname=makekeyname(string(psurname,'' '',pforenames))'
  end if;
  if "isnull"("pgender",'') <> "isnull"("poldgender",'') then
    set "ssql" = "ssql"+',sex=pgender'
  end if;
  if "isnull"("pdob",'') <> "isnull"("pOLDdob",'') then
    set "dateofbirth" = "IQXNetStringToDate"("pdob");
    if "trim"("isnull"("pdob",'')) <> '' and "dateofbirth" is null then
      select '1:~Invalid date of birth';
      return
    end if;
    set "ssql" = "ssql"+',dob = dateofbirth'
  end if;
  if "isnull"("paddr1",'') <> "isnull"("poldaddr1",'') then
    set "ssql" = "ssql"+',addr1=paddr1'
  end if;
  if "isnull"("paddr2",'') <> "isnull"("poldaddr2",'') then
    set "ssql" = "ssql"+',addr2=paddr2'
  end if;
  if "isnull"("paddr3",'') <> "isnull"("poldaddr3",'') then
    set "ssql" = "ssql"+',addr3=paddr3'
  end if;
  if "isnull"("ptown",'') <> "isnull"("poldtown",'') then
    set "ssql" = "ssql"+',town=ptown'
  end if;
  if "isnull"("pcounty",'') <> "isnull"("poldcounty",'') then
    set "ssql" = "ssql"+',county=pcounty'
  end if;
  if "isnull"("pcountry",'') <> "isnull"("poldcountry",'') then
    set "ssql" = "ssql"+',country=pcountry'
  end if;
  if "isnull"("ppostcode",'') <> "isnull"("poldpostcode",'') then
    set "ssql" = "ssql"+',postcode=ucase(ppostcode)'
  end if;
  if "ssql" <> '' then
    execute immediate 'update person set '+"stuff"("ssql",1,1,'')+' where personid=ppersonid'
  end if;
  if "isnull"("phomephone",'') <> "isnull"("pOLDhomephone",'') then
    call "setphone"('P','Home Telephone',"ppersonid","phomephone")
  end if;
  if "isnull"("pdayphone",'') <> "isnull"("pOLDdayphone",'') then
    call "setphone"('P','Day Telephone',"ppersonid","pdayphone")
  end if;
  if "isnull"("pmobile",'') <> "isnull"("pOLDmobile",'') then
    call "setphone"('P','Mobile',"ppersonid","pmobile")
  end if;
  if "isnull"("pemail",'') <> "isnull"("pOLDemail",'') then
    call "setphone"('P','E-mail',"ppersonid","pemail");
    update "iqxnetuserlink" key join "iqxnetuser" set "iqxnetuser"."emailaddress" = "pemail" where "iqxnetuserlink"."personid" = "ppersonid"
  end if;
  call "IQXNetSaveQuestionnaire"("ppersonid","qanswers");
  call "personrecordupdated"("ppersonid");
  select '0:~Success'
end