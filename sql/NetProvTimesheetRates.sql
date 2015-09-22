create procedure pears.NetProvTimesheetRates(in pWebUserID char(20),in pTempProvTimesheetID char(20))
result(TempProvTimesheetLineID char(20),IsExpenses smallint,BandDescription char(50),UnitDescription char(100),Units decimal(12,2),Rate decimal(12,2),Total decimal(12,2),CanEditUnits smallint,CanEdit smallint,Rate2 decimal(12,2),Total2 decimal(12,2))
// IQXWeb
begin
  declare userclass char(20);
  set userclass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);
  if userclass = 'CLIENT' then
    select TempProvTimesheetLine.TempProvTimesheetLineID,
      (if isnull(temppayband.payrollflag,'') = 'EXPENSES' or isnull(temppayband.isexpenses,0) = 1 then 1 else 0
      endif) as IsExpenses,temppayband.description,
      (if IsExpenses = 1 then tempprovtimesheetline.description else temppayband.unit
      endif),nullif(tempprovtimesheetline.unitscharged,0.0) as units,nullif(tempprovtimesheetline.chargerate,0.0) as rate,isnull(units*rate,0.0) as total,
      (if units is null or isnull(tempprovtimesheetline.description,'') = 'Units Edited' or NetVacancyHasRateScript(t.tempjobtypeid,t.vacancyid) = 0 then 1 else 0
      endif) as CanEditUnits,(if IsExpenses = 1 or CanEditUnits = 1 then 1 else 0
      endif) as CanEdit,null,null
      from tempprovtimesheetline key join(temppayband,tempprovtimesheet as t)
      where tempprovtimesheetline.tempprovtimesheetid = pTempProvTimesheetID order by
      tempprovtimesheetline.linenumber asc
  else
    if userclass = 'OWNER' then
      select TempProvTimesheetLine.TempProvTimesheetLineID,
        (if isnull(temppayband.payrollflag,'') = 'EXPENSES' or isnull(temppayband.isexpenses,0) = 1 then 1 else 0
        endif) as IsExpenses,temppayband.description,
        (if IsExpenses = 1 then tempprovtimesheetline.description else temppayband.unit
        endif),nullif(tempprovtimesheetline.unitspaid,0.0) as units,nullif(tempprovtimesheetline.payrate,0.0) as rate,isnull(units*rate,0.0) as total,
        (if units is null or isnull(tempprovtimesheetline.description,'') = 'Units Edited' or NetVacancyHasRateScript(t.tempjobtypeid,t.vacancyid) = 0 then 1 else 0
        endif) as CanEditUnits,(if IsExpenses = 1 or CanEditUnits = 1 then 1 else 0
        endif) as CanEdit,nullif(tempprovtimesheetline.chargerate,0.0) as rate2,isnull(units*rate2,0.0) as total2
        from tempprovtimesheetline key join(temppayband,tempprovtimesheet as t)
        where tempprovtimesheetline.tempprovtimesheetid = pTempProvTimesheetID order by
        tempprovtimesheetline.linenumber asc
    else
      select TempProvTimesheetLine.TempProvTimesheetLineID,
        (if isnull(temppayband.payrollflag,'') = 'EXPENSES' or isnull(temppayband.isexpenses,0) = 1 then 1 else 0
        endif) as IsExpenses,temppayband.description,
        (if IsExpenses = 1 then tempprovtimesheetline.description else temppayband.unit
        endif),nullif(tempprovtimesheetline.unitspaid,0.0) as units,nullif(tempprovtimesheetline.payrate,0.0) as rate,isnull(units*rate,0.0) as total,
        (if units is null or isnull(tempprovtimesheetline.description,'') = 'Units Edited' or NetVacancyHasRateScript(t.tempjobtypeid,t.vacancyid) = 0 then 1 else 0
        endif) as CanEditUnits,(if IsExpenses = 1 or CanEditUnits = 1 then 1 else 0
        endif) as CanEdit,null,null
        from tempprovtimesheetline key join(temppayband,tempprovtimesheet as t)
        where tempprovtimesheetline.tempprovtimesheetid = pTempProvTimesheetID order by
        tempprovtimesheetline.linenumber asc
    end if
  end if
end