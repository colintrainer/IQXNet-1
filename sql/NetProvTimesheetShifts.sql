create procedure pears.NetProvTimesheetShifts(in pWebUserID char(20),in pTempProvTimesheetID char(20))
result(tempshiftid char(20),shiftdate date,timefrom time,timeto time,breakminutes smallint,tick smallint,description char(50),weekenddate date,shiftduration double)
// IQXWeb
begin
  select s.tempshiftid,s.shiftdate,s.timefrom,s.timeto,s.breakminutes,
    (if t.extnumber = 2 then(select first 1 from tempprovtimesheetshift where tempprovtimesheetid = t.tempprovtimesheetid and tempshiftid = s.tempshiftid) else 1
    endif) as tick,p.description,weekmonthenddate(t.period,t.periodlength) as weekenddate,getshiftlength(s.timefrom,s.timeto,s.breakminutes) as shiftduration
    from tempshift as s join tempprovtimesheet as t on s.personid = t.personid and s.vacancyid = t.vacancyid
    ,tempshift as s key left outer join tempshiftplan as p
    ,tempprovtimesheet as t key join person
    where t.tempprovtimesheetid = pTempProvTimesheetID
    and t.extnumber > 0 and s.state in( 'P','B') and tick = 1
    and s.shiftdate between weekenddate-6 and weekenddate order by
    s.shiftdate asc,s.timefrom asc
end