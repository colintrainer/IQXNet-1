create procedure pears.NetCandidatePersonID( in pWebUserID char(20) ) 
result( PersonID char(20) ) 
begin
select first L.personid from iqxnetuserlink L key join iqxnetuser U 
  where U.iqxnetuserid=pWebUserID and U.iqxnetuserclassid='CANDIDATE' and L.personid is not null
end