create PROCEDURE pears."NetTimesheetShifts"(in pWebUserID char(20),in pTempTimesheetID char(20))
result(tempshiftid char(20),shiftdate date,timefrom time,timeto time,breakminutes smallint,description char(50),weekenddate date,shiftduration double)
// IQXWeb
begin
  select s.tempshiftid,s.shiftdate,s.timefrom,s.timeto,s.breakminutes,
    p.description,weekmonthenddate(t.period,t.periodlength) as weekenddate,
    getshiftlength(s.timefrom,s.timeto,s.breakminutes) as shiftduration
    from tempshift as s key join temptimesheet as t
    ,tempshift as s key left outer join tempshiftplan as p
    ,temptimesheet as t key join person
    where t.temptimesheetid = pTempTimesheetID
    and s.shiftdate between weekenddate-6 and weekenddate order by
    s.shiftdate asc,s.timefrom asc
end