ALTER PROCEDURE "pears"."NetReferenceSet"( in "pWebUserID" char(20), in "pReferenceRequestID" char(20), in "qanswers" long varchar default null, in pDepartmentID char(2), in pPosition char(100), in pPositionNotes long varchar, in pRefereeAddressName char(60), in ppersonName char(30), in pCompleted smallint default 0, in pReferenceConfirmationRequired smallint DEFAULT 0) 
result( "pResult" char(250) ) 
begin
  if pCompleted=1 then
	UPDATE ReferenceRequest SET WhenCompleted=current timestamp, ReferenceConfirmationRequired=pReferenceConfirmationRequired WHERE ReferenceRequestID = pReferenceRequestID;
  end if;
  call "IQXNetSaveQuestionnaire"("pReferenceRequestID","qanswers");
  select '0:~Success'
end