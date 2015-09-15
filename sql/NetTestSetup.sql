create PROCEDURE pears."NetTestSetup"( in pWebUserID char(20))
result(pResult char(250))
BEGIN
insert into person (personid,name,keyname,forenames,surname) on existing update values ('TEST','test','TEST','test','test');
insert into company (companyid,name,keyname) on existing update values ('TEST','test','TEST');
insert into employment (employmentid,companyid,personid) on existing update values ('TEST','TEST','TEST');
insert into department (departmentid,name) on existing update values ('~~','test');
insert into tempdesk (tempdeskid,departmentid,name) on existing update values ('TEST','~~','test');
insert into vacancy (vacancyid,departmentid,employmentid,tempdeskid,position) on existing update values ('TEST','~~','TEST','TEST','test');
insert into staff (staffid,defaultdepartid,shortid,userid) on existing update values ('TEST','~~','~~','test');

insert into iqxnetuser(iqxnetuserid,iqxnetuserclassid,loginid,name,expirydate,staffid) on existing update values ('TEST.CANDIDATE','CANDIDATE','test.user.candidate','test.user.candidate',null,null);
insert into iqxnetuser(iqxnetuserid,iqxnetuserclassid,loginid,name,expirydate,staffid) on existing update values ('TEST.CLIENT','CLIENT','test.user.client','test.user.client',null,null);
insert into iqxnetuser(iqxnetuserid,iqxnetuserclassid,loginid,name,expirydate,staffid) on existing update values ('TEST.NOBODY','OWNER','test.user.nobody','test.user.nobody',current date-100,null);
update iqxnetuser set password=(select first password from iqxnetuser where loginid='ADMINISTRATOR'),passwordset=1 where loginid like 'test.user.%';
insert into iqxnetuserlink(iqxnetuserlinkid,iqxnetuserid,personid) on existing update values ('TEST.CANDIDATE','TEST.CANDIDATE','TEST');
insert into iqxnetuserlink(iqxnetuserlinkid,iqxnetuserid,employmentid) on existing update values ('TEST.CLIENT','TEST.CLIENT','TEST');

select '0:~Success';
END