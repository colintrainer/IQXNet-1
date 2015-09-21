create PROCEDURE pears."NetCandidateDocuments"(in pWebUserID char(20),in pPersonID char(20) default null)
result(DocType char(50),DocDescription char(50),LastUpdate timestamp,SpecialType char(50),DocumentID char(20),PersonID char(20),SortOrder integer)
// IQXWeb
begin
  declare userClass char(20);
  declare isCandorAgency smallint;
  if iqxnethaspermission(pwebuserid,'DOCCANDDOWNLOAD') = 0 then
    set pPersonID=null
  else
    set userClass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pWebUserID);
    if userClass = 'CANDIDATE' then
      set isCandorAgency=1;
      set pPersonID=(select first personid from iqxnetuserlink where personid = isnull(pPersonID,personid) and iqxnetuserid = pwebuserid)
    else if userClass = 'AGENCY' then
        set isCandorAgency=1;
        set pPersonID=(select first pay_employee.personid
            from pay_employee key join company as agcomp key join employment as agemp key join iqxnetuserlink
            where pay_employee.personid = ppersonid and iqxnetuserlink.iqxnetuserid = pwebuserid)
      else
        set isCandorAgency=0
      end if
    end if
  end if;
  select documenttype.description,oledocument.description,isnull(blobstore.changedat,blobstore.createdat),'',oledocument.oledocumentid,oledocument.ownerid,100+isnull(documenttype.sortorder,0) as ord
    from oledocument join blobstore on blobstore.id = oledocument.oledocumentid and blobstore.class = 'O'
    ,oledocument key join documenttype
    where oledocument.ownertype = 'P' and oledocument.ownerid = ppersonid and(oledocument.rawfile = 1 or blobstore.zipped = 2)
    and blobstore.publishtoweb = 1 union all
  select 'Primary','CV',isnull(blobstore.changedat,blobstore.createdat),'PRIMARY_CV',null,blobstore.id,1 as ord
    from blobstore where blobstore.class = 'V' and blobstore.id = pPersonID and blobstore.zipped = 2 and(isCandorAgency = 1 or blobstore.publishtoweb = 1) union all
  select 'Primary','Photo',isnull(blobstore.changedat,blobstore.createdat),'PRIMARY_PHOTO',null,blobstore.id,2 as ord
    from blobstore where blobstore.class = 'J' and blobstore.id = pPersonID and(isCandorAgency = 1 or blobstore.publishtoweb = 1) order by
    ord asc
end