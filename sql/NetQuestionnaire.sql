create PROCEDURE pears."NetQuestionnaire"(in pWebUserID char(20),in ptaglocation char(3),in pid char(20) default null,in pgroup smallint default null)
result(tagsortorder smallint,tagid char(3),sortX smallint,choicesortorder smallint,tagchoiceid char(4),rectype smallint,description char(100),tagtype char(1),minstep double,units char(10),required smallint,displaygroup smallint,value double,textvalue long varchar,taglocation char(3),tagchoiceparentid char(4))
begin
  -- 20120907 modified to insert long text for question title. retrieve from LongDescription
  -- sortX=0 for tags, 1 for subchoices, 2 for choices and values
  -- rectype=0 for tags, 1 for choices, 2 for subchoices, 3 for values
  declare ispublic smallint;
  declare divid char(20);
  declare userclass char(20);
  if pid is null then
    set ispublic=0;
    if ptaglocation like '[PA]%' then
      set pid=(select first personid from iqxnetuserlink where iqxnetuserid = pwebuserid)
    else if ptaglocation = 'E' then
        set pid=(select first employmentid from iqxnetuserlink where iqxnetuserid = pwebuserid)
      else if ptaglocation = 'C' then
          set pid=(select first employment.companyid from iqxnetuserlink key join employment where iqxnetuserlink.iqxnetuserid = pwebuserid)
        end if
      end if
    end if
  else
    set userclass=(select first iqxnetuserclassid from iqxnetuser where iqxnetuserid = pwebuserid);
    if userclass = 'OWNER' then
      set ispublic=0; -- Owner rights to all record types but they only see the data if they own the record
      set DivID=(select first staff.divisionid from iqxnetuser key join staff where iqxnetuser.iqxnetuserid = pWebUserID);
      if ptaglocation like '[PA]%' then
        set pid=(select first personid from person where personid = pid and divisionid = divid)
      else if ptaglocation = 'E' then
          set pid=(select first e.employmentid from employment as e key join company as c where e.employmentid = pid and c.divisionid = divid)
        else if ptaglocation = 'C' then
            set pid=(select first companyid from company where companyid = pid and divisionid = divid)
          end if
        end if
      end if
    else
      set ispublic=1 -- Read only access to web view questions only
    end if
  end if;
  select tag.sortorder,tag.tagid,0 as sortX,cast(null as smallint),cast(null as char(4)),0 as rectype,isnull(tag.longdescription,tag.description),tag.tagtype,tag.minstep,tag.units,
    tag.required,isnull(tag.displaygroup,0) as displaygroup,cast(null as double),cast(null as long varchar),tag.taglocation,cast(null as char(4))
    from tag where tag.taglocation = ptaglocation and(if ispublic = 1 then tag.publiconweb else tag.publishtoweb
    endif) = 1 and(isnull(pgroup,0) = 0 or displaygroup = pgroup) union all
  select tag.sortorder,tag.tagid,3-(isnull(tagchoice.subchoice,0)+1) as sortX,tagchoice.sortorder,tagchoice.tagchoiceid,isnull(tagchoice.subchoice,0)+1 as rectype,
    isnull(tagchoice.longdescription,tagchoice.description),null,null,null,null,isnull(tag.displaygroup,0) as displaygroup,tagchoice.value,cast(null as long varchar),null,tagchoice.tagchoiceparentid
    from tagchoice key join tag where tag.taglocation = ptaglocation and(if ispublic = 1 then tag.publiconweb else tag.publishtoweb
    endif) = 1 and isnull(tagchoice.donotpublishtoweb,0) = 0
    and(isnull(pgroup,0) = 0 or displaygroup = pgroup) union all
  select tag.sortorder,tag.tagid,2 as sortX,tagchoice.sortorder,tagchoice.tagchoiceid,3 as rectype,null,null,null,null,null,
    isnull(tag.displaygroup,0) as displaygroup,tagvalue.value,tagvalue.textvalue,null,null
    from tagvalue key join tag,tagvalue key left outer join tagchoice
    where tagvalue.id = pid and tag.taglocation = ptaglocation and(if ispublic = 1 then tag.publiconweb else tag.publishtoweb
    endif) = 1 and isnull(tagchoice.donotpublishtoweb,0) = 0
    and(isnull(pgroup,0) = 0 or displaygroup = pgroup) order by
    1 asc,2 asc,3 asc,4 asc,5 asc,6 asc
end