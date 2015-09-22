create procedure "pears"."NetAPIProcSet"( in "pWebUserID" char(20),in "pOwner" char(50),in "pName" char(50),in "pBody" long varchar ) 
result( "pResult" char(250) ) 
// IQXWeb
begin
  declare "iSpace" tinyint;
  if "IQXNetHasPermission"("pWebUserID",'APIDESIGN') = 0 then
    select '99:~Permission denied';
    return
  end if;
  set "pBody" = "ltrim"("pBody");
  set "iSpace" = "charindex"(' ',"pBody");
  if exists(select "p"."proc_name" from "sys"."sysprocedure" as "p" join "sys"."sysuser" as "u" on "p"."creator" = "u"."user_id"
      where "p"."proc_name" = "pName" and "u"."user_name" = "pOwner") then
    set "pBody" = "stuff"("pBody",1,"iSpace",'Alter ')
  else
    set "pBody" = "stuff"("pBody",1,"iSpace",'Create ')
  end if;
  execute immediate "pBody";
  execute immediate 'grant execute on '+"pOwner"+'.'+"pName"+' to IQXNet';
  select '0:~Success'
end