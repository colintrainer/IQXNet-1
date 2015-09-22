create procedure pears.NetProvTimesheetTimes(in pWebUserID char(20),in pTempProvTimesheetID char(20))
result(placementid char(20),weekstartdate date,shiftdate date,dayticked smallint,tickednormalhours double,hours double,timefrom time)
// IQXWeb
begin
  select p.placementid,
    weekmonthenddate(t.period,t.periodlength)-6 as weekstartdate,
    "date"(dateadd(day,r.row_num-1,weekstartdate)) as shiftdate,
    (case dow(shiftdate)-1 when 0 then p.worksunday when 1 then p.workmonday when 2 then p.worktuesday when 3 then p.workwednesday
    when 4 then p.workthursday when 5 then p.workfriday when 6 then p.worksaturday end) as dayticked,
    (if isnull(dayticked,0) = 1 then p.worknormalhours else null
    endif) as tickednormalhours,(if isnull(v.workcancelled,0) = 0 then isnull(v.workhours,tickednormalhours) else null
    endif) as hours,isnull(v.workstarttime,p.workstarttime) as timefrom
    from(placement as p left outer join placementdayvariation as v
    on p.placementid = v.placementid and v.variationdate = shiftdate)
    ,placement as p join dbo.rowgenerator as r on r.row_num between 1 and 7
    ,placement as p key join tempprovtimesheet as t
    ,placement as p key join employment as e
    where t.tempprovtimesheetid = pTempProvTimesheetID
    and shiftdate between isnull(e.startdate,shiftdate) and isnull(e.leavedate,shiftdate)
end