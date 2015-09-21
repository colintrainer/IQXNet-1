create procedure pears.NetForgottenPassword(in pWebUserID char(20),in login_email char(50))
result(retval char(255))
// IQXWeb
begin
  declare PersID char(20);
  set PersID=(select first IQXNetUserID from IQXNetUser where EmailAddress = login_email);
  if isnull(PersID,'') <> '' then
    update IQXNetUser set PasswordSet = 2 where IQXNetUserID = PersID;
    select '0:~success'
  else
    select '100:~Email address not found'
  end if
end