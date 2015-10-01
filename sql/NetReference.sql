create procedure "pears"."NetReference"( in "pWebUserID" char(20), in "pReferenceRequestCode" char(250) ) 
result(  -- 24-09-2015 Created
 ReferenceRequestID char(20), DepartmentID char(20), Position char(100), PositionNotes long varchar, RefereeAddressName char(60), personName char(30) ) 
-- IQXNet
begin
  SELECT 
  	ReferenceRequestID, 
  	DepartmentID, 
  	Position, 
  	PositionNotes, 
  	RefereeAddressName,
  	Person.name
  FROM "pears"."ReferenceRequest" KEY JOIN Person
  WHERE "URLRequestCode" = "pReferenceRequestCode" 
  AND WhenCompleted is null
end