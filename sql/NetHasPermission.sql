create FUNCTION pears."NetHasPermission"( in pWebUserID char(20), in pPersonID char(20), in pCompanyID char(20) )
RETURNS INTEGER
BEGIN
	DECLARE "rv" INTEGER;
    declare userclass char(20);
    set rv=0;
	select iqxnetuserclassid into userclass from iqxnetuser where iqxnetuserid=pwebuserid;
    if userclass='CANDIDATE' then
       set rv=(select first 1 from iqxnetuserlink where personid=ppersonid and iqxnetuserid=pwebuserid)
    else if userclass='CLIENT' then
       set rv=(select first 1 from employment e key join iqxnetuserlink x where e.companyid=pcompanyid and x.iqxnetuserid=pwebuserid)
    else if userclass='AGENCY' then
       set rv=(select first 1 from pay_employee pe key join company key join employment key join iqxnetuserlink x where pe.personid=ppersonid and x.iqxnetuserid=pwebuserid)
    else if userclass='OWNER' then
       set rv=(select first 1 from staff key join iqxnetuser u where staff.divisionid=(select divisionid from person where personid=ppersonid)
            and staff.divisionid=(select divisionid from company where companyid=pcompanyid) and u.iqxnetuserid=pwebuserid)
    end if
    end if
    end if
    end if;
	RETURN isnull(rv,0);
END