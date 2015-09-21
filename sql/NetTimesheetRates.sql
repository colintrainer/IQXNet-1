create procedure pears.NetTimesheetRates(in pWebUserID char(20),in pTempTimesheetID char(20))
result(TempTimesheetLineID char(20),IsExpenses smallint,BandDescription char(50),UnitDescription char(100),Units decimal(12,2),Rate decimal(12,2),Total decimal(12,2),Rate2 decimal(12,2),Total2 decimal(12,2))
// IQXWeb
begin
  declare uclass char(20);
  declare divid char(20);
  set uclass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);
  if uclass = 'CLIENT' then
    select TempTimesheetLine.TempTimesheetLineID,
      (if isnull(temppayband.payrollflag,'') = 'EXPENSES' or isnull(temppayband.isexpenses,0) = 1 then 1 else 0
      endif) as IsExpenses,temppayband.description,
      (if IsExpenses = 1 then temptimesheetline.description else temppayband.unit
      endif),nullif(temptimesheetline.unitscharged,0.0) as units,nullif(temptimesheetline.chargerate,0.0) as rate,isnull(units*rate,0.0) as total,null,null
      from temptimesheetline key join temppayband where temptimesheetline.temptimesheetid = pTempTimesheetID order by
      temptimesheetline.linenumber asc
  else if uclass = 'OWNER' then
      select TempTimesheetLine.TempTimesheetLineID,
        (if isnull(temppayband.payrollflag,'') = 'EXPENSES' or isnull(temppayband.isexpenses,0) = 1 then 1 else 0
        endif) as IsExpenses,temppayband.description,
        (if IsExpenses = 1 then temptimesheetline.description else temppayband.unit
        endif),nullif(temptimesheetline.unitspaid,0.0) as units,nullif(temptimesheetline.payrate,0.0) as rate,isnull(units*rate,0.0) as total,
        nullif(temptimesheetline.chargerate,0.0) as rate2,isnull(units*rate2,0.0) as total2
        from temptimesheetline key join temppayband where temptimesheetline.temptimesheetid = pTempTimesheetID order by
        temptimesheetline.linenumber asc
    else
      select TempTimesheetLine.TempTimesheetLineID,
        (if isnull(temppayband.payrollflag,'') = 'EXPENSES' or isnull(temppayband.isexpenses,0) = 1 then 1 else 0
        endif) as IsExpenses,temppayband.description,
        (if IsExpenses = 1 then temptimesheetline.description else temppayband.unit
        endif),nullif(temptimesheetline.unitspaid,0.0) as units,nullif(temptimesheetline.payrate,0.0) as rate,isnull(units*rate,0.0) as total,null,null
        from temptimesheetline key join temppayband where temptimesheetline.temptimesheetid = pTempTimesheetID order by
        temptimesheetline.linenumber asc
    end if
  end if
end