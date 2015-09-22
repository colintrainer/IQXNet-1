create procedure "pears"."NetCandidateRegister"( in "pWebUserID" char(20),in "pNewWebUserID" char(20),in "pForenames" char(50),in "pSurname" char(50),in "pemail" char(250),
  in "pGender" char(20) default null,in "pdob" char(20) default null,in "pNINumber" char(20) default null,in "phomephone" char(250) default null,in "pDayPhone" char(250) default null,in "pMobile" char(250) default null,
  in "pAddr1" char(50) default null,in "pAddr2" char(50) default null,in "pAddr3" char(50) default null,in "pTown" char(50) default null,in "pCounty" char(50) default null,in "pCountry" char(50) default null,in "pPostcode" char(50) default null,
  in "qanswers" long varchar default null ) 
result( "pResult" char(250) ) 
// IQXWeb
begin
  declare "dateofbirth" date;
  declare "ppersonid" char(20);
  declare "pfirstname" char(50);
  declare "pnewappnumber" integer;
  declare "pnewstatus" char(1);
  declare "chained" char(3);
  set "chained" = (select "connection_property"('chained'));
  set "dateofbirth" = "IQXNetStringToDate"("pdob");
  if "trim"("isnull"("pdob",'')) <> '' and "dateofbirth" is null then
    select '1:~Invalid date of birth';
    return
  end if;
  set "ppersonid" = "uniquekey"("pNewWebUserID");
  set "pfirstname" = "getword"("pforenames",1);
  if "chained" = 'On' then
    begin atomic
      update "params" set "nextappnumber" = "isnull"("nextappnumber",0)+1 where "autoappnumber" = 1;
      if @@rowcount > 0 then
        set "pnewappnumber" = (select first "nextappnumber" from "params")
      else
        set "pnewappnumber" = null
      end if
    end
  else update "params" set "nextappnumber" = "isnull"("nextappnumber",0)+1 where "autoappnumber" = 1;
    if @@rowcount > 0 then
      set "pnewappnumber" = (select first "nextappnumber" from "params")
    else
      set "pnewappnumber" = null
    end if end if;
  set "pnewstatus" = (select first "initialapplicantstatus" from "params");
  set "pnewstatus" = "isnull"("pnewstatus",'C');
  insert into "person"( "personid","forenames","surname","name","keyname","salutation","sex","dob","addr1","addr2","addr3","town","county","country","postcode","appnumber","staffid","status","registrationdate","ni" ) values
    ( "ppersonid","pforenames","psurname","string"("pfirstname",' ',"psurname"),"makekeyname"("string"("psurname",' ',"pforenames")),
    "pfirstname","pgender","dateofbirth","paddr1","paddr2","paddr3","ptown","pcounty","pcountry","ucase"("ppostcode"),"pnewappnumber","userstaffid","pnewstatus",current date,"pNINumber" ) ;
  call "personrecordupdated"("ppersonid");
  insert into "iqxnetuserlink"( "iqxnetuserlinkid","iqxnetuserid","personid" ) values( "ppersonid","pnewwebuserid","ppersonid" ) ;
  if "phomephone" is not null then
    call "setphone"('P','Home Telephone',"ppersonid","phomephone")
  end if;
  if "pdayphone" is not null then
    call "setphone"('P','Day Telephone',"ppersonid","pdayphone")
  end if;
  if "pmobile" is not null then
    call "setphone"('P','Mobile',"ppersonid","pmobile")
  end if;
  if "pemail" is not null then
    call "setphone"('P','E-mail',"ppersonid","pemail")
  end if;
  call "IQXNetSaveQuestionnaire"("ppersonid","qanswers");
  select '0:~Success'
end