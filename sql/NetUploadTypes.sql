create procedure pears.NetUploadTypes(in pWebUserID char(20),in pOwnerType char(1))
result(UploadTypes char(900))
// IQXWeb
begin
  declare rv char(900);
  if pOwnerType = 'P' then
    set rv='primary_cv]~[CV]~[primary_photo]~[Photo]~['
  else
    set rv=''
  end if;
  set rv=rv+isnull((select list(string(DocumentTypeID,']~[',Description),']~[' order by SortOrder asc,Description asc) from DocumentType where isnull(Class,pownertype) = pownertype and CanLoadFromWeb = 1),'');
  select rv
end