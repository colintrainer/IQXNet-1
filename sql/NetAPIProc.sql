create PROCEDURE pears."NetAPIProc"(in pWebUserID char(20), in pOwner char(50), in pName char(50) ) 
result(ProcBody long varchar)
// IQXWeb
BEGIN
select isnull(p.source,p.proc_defn) from sys.sysprocedure p join sys.sysuser u on p.creator=u.user_id 
      where p.proc_name = pName and u.user_name=pOwner and IQXNetHasPermission(pWebUserID,'APIDESIGN') = 1;
END