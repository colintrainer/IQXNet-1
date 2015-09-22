create PROCEDURE pears."NetCandidateDiary"(in pWebUserID char(20))
result(DiaryID char(50),DiaryClass char(50),ActionType char(50),Description char(100),DiaryStatus char(50),DateFrom date,DateTo date,TimeFrom time,TimeTo time)
// IQXWeb
begin
  declare pstart date;
  set pstart=current date-30;
  while dow(pstart) <> 2 loop
    set pstart=pstart-1
  end loop;
  select string('Shift_',s.tempshiftid) as DiaryID,
    (case s.state when 'H' then 'Holiday' when 'U' then 'Unavailable' when 'A' then 'Available' when 'C' then 'Cancelled'
    else 'Working'
    end) as DiaryClass,(case s.state when 'H' then 'deleteable_shift' when 'U' then 'deleteable_shift' when 'A' then 'deleteable_shift' when 'P' then 'confirmable_shift' when 'C' then 'cancelled_shift' end) as ActionType,
    isnull(company.name,tempshiftunavailablereason.name) as Description,
    (if s.state = 'P' then 'Provisional'
    else ''
    endif) as DiaryStatus,s.shiftdate as DateFrom,
    isnull((if s.timeto <= s.timefrom then s.shiftdate+1 else s.shiftdate
    endif),s.shiftdate) as DateTo,
    s.TimeFrom,
    s.TimeTo
    from tempshift as s key join person key join iqxnetuserlink
    ,tempshift as s key left outer join tempshiftunavailablereason
    ,tempshift as s key left outer join(vacancy key join employment key join company)
    where iqxnetuserlink.iqxnetuserid = pwebuserid
    and s.shiftdate >= pstart-1 and not(s.state = 'C' and isnull(s.tempconfirmed,0) = 1) union all
  select string('Employment_',e.employmentid) as DiaryID,'Working' as DiaryClass,'' as ActionType,
    company.name as Description,'' as DiaryStatus,
    e.startdate as DateFrom,
    e.leavedate as DateTo,
    cast(null as time) as TimeFrom,
    cast(null as time) as TimeTo
    from employment as e key join(person,company)
    ,person key join iqxnetuserlink
    where iqxnetuserlink.iqxnetuserid = pwebuserid
    and(e.leavedate is null or e.leavedate >= pstart)
    and isnull(e.concurrent,0) = 0 order by
    DateFrom asc,TimeFrom asc
end