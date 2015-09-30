ALTER PROCEDURE "pears"."NetSearchJobs"( in "pWebUserID" char(20),in "pVacancyType" char(1) default null,in "pMinPay" decimal(7,2) default 0,in "pMaxPay" decimal(7,2) default 1000000,in "pLocation" char(30) default '%',in "pKeywordSearch" char(50),in "pPageNo" integer default 1,in "pPageSize" integer default 20 ) 
result( "vacancyid" char(20),"position" char(60),"VacType" char(20),"OurRef" char(10),"TempRate" char(10),"AnnualisedPay" integer ) 
-- 20150929 Job search for Change
begin
  declare "SearchLocation" char(30);
  declare "PayThresholdHourly" decimal(7,2);
  declare "PayThresholdDaily" decimal(7,2);
  declare "AnnualisationFactorHourly" real;
  declare "AnnualisationFactorDaily" real;
  declare "AnnualisationFactorYearly" real;
  declare "StartRecord" integer;
  declare "SampleSize" integer;
  set "SearchLocation" = "isnull"("pLocation",'%');
  set "PayThresholdHourly" = 60;
  set "PayThresholdDaily" = 2000;
  set "AnnualisationFactorHourly" = 35*52;
  set "AnnualisationFactorDaily" = 240;
  set "AnnualisationFactorYearly" = 1;
  set "StartRecord" = ("isnull"("pPageNo",1)-1)*"pPageSize"+1;
  set "SampleSize" = "isnull"("pPageSize",20);
  select top "SampleSize" start at "StartRecord"
    "v"."vacancyid",
    "v"."position",
    (if "v"."temp" = 1 then 'temporary/interim'
    else 'permanent'
    endif) as "VacancyType",
    "v"."refcode",
    (if "v"."temp" = 1 then cast("GetTempRate"('P','V',"vacancyid") as decimal(7,2)) else null endif) as "TempRate",
    "isnull"("v"."salary",("TempRate"*"SearchPayFactor"),0) as "PayAnnualised",
    (if "TempRate" < "PayThresholdHourly" then "AnnualisationFactorHourly"
    else if "TempRate" > "PayThresholdDaily" then "AnnualisationFactorYearly"
      else "AnnualisationFactorDaily"
      endif
    endif) as "SearchPayFactor",
    "v"."whenentered"
    from "vacancy" as "v"
    where cast("v"."temp" as char(1)) like "isnull"("pVacancyType",'%')
    and "PayAnnualised" between "isnull"("pMinPay",0) and "isnull"("pMaxPay",1000000)
    and("isnull"("v"."town",'%') like "SearchLocation" or "isnull"("v"."county",'%') like "SearchLocation" or "isnull"("v"."country",'%') like "SearchLocation")
    and "isnull"("notes",'%%') like '%'+"pKeywordSearch"+'%'
    order by "v"."whenentered" asc
end
