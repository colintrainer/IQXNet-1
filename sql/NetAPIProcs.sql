create procedure pears.NetAPIProcs( in pWebUserID char(20),in pOwner char(50),in pRoot char(50) ) 
result( ProcName char(128),ProcBody long varchar ) 
// IQXWeb
begin
  select p.proc_name,isnull(p.source,p.proc_defn) from sys.sysprocedure as p join sys.sysuser as u on p.creator = u.user_id
    where p.proc_name like pRoot+'%' and u.user_name = pOwner and IQXNetHasPermission(pWebUserID,'APIDESIGN') = 1
end