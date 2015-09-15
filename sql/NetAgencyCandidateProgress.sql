create procedure pears.NetAgencyCandidateProgress( in pWebUserID char(20),in pPersonID char(20) ) 
result( dFromDate date,tFromTime time,CompanyName char(100),JobDescription char(100),sFrom char(20),sTo char(20),State char(50) ) 
begin
  select vacancy.startdate as d1,cast('00:00' as time) as t1,company.name,vacancy.position,dateformat(vacancy.startdate,'dd/mm/yyyy'),dateformat(vacancy.finishdate,'dd/mm/yyyy'),status.name
    from company key join employment key join vacancy key join progress join status on status.type = 'R' and status.status = progress.status
    where progress.personid = pPersonID union all
  select p.shiftdate as d1,p.timefrom as t1,company.name,string(vacancy.position,' - ',p.description),
    string(dateformat(p.shiftdate,'dd/mm/yyyy'),' ',dateformat(p.timefrom,'hh:nn')),
    string(dateformat((if p.TimeFrom < p.TimeTo then p.ShiftDate else p.ShiftDate+1 endif),'dd/mm/yyyy'),' ',
    dateformat(p.timeto,'hh:nn')),
    status.name
    from company key join employment key join vacancy key join tempshiftplan as p key join tempshiftprogress join status on status.type = 'S' and status.status = tempshiftprogress.status
    where tempshiftprogress.personid = pPersonID
    order by 1 asc,2 asc
end