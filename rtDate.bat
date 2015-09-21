:: ====================================== 
:: Batch File to run Mocha Test Scripts
:: Colin Trainer
:: 18/09/2015
:: Cut down version uploaded to test the GitHub Process
:: 
::
:: Michael, I have created this file, commited this change to the local repository
:: and pushed this change/new file up to GitHub.
:: I'm assuming the next stage is you will be informed that it has been added to
:: the IQXNet-1 Branch and then you can decide to push/merge it into the master branch
:: Like I said, this is a new file so if it does go directly to the Master it won't have the same knock on effect
:: that occurred last week
::
::	Colin
::
:: ======================================

@echo off
:start
set /p testID="Enter Name of Test: "

:determineOutputFolder
set /p oFolder="Enter Output Folder Name: "
REM Get Full Path
REM echo About to check if %~dp0output\%oFolder% exists
pause
set oDate = DATE
REM IF EXIST %~dp0output\%oFolder%\ goto folderExistsContinue else goto createNewFolder 

:createNewFolder
rem echo %~dp0%oFolder%\
REM echo About to create new folder %~dp0output\%oFolder%
REM pause
REM cd\%~dp0output\%oFolder%
REM md\%oFolder% 
REM goto folderExistsContinue

:folderExistsContinue
REM echo Starting folderExistsContinue
REM echo The folder and file being written to are;
REM echo %~dp0\output\%oFolder%\%testID%.txt
REM echo Path to check for existence is %~dp0%oFolder%
REM IF EXIST %~dp0%oFolder%\ goto folderCreated else goto folderNotCreated
REM pause

:folderCreated
REM echo Starting folderCreated
REM echo Folder %~dp0%oFolder%\ has been created
REM pause
REM goto runTestandWriteFile

:folderNotCreated
REM echo Starting folderNotCreated
REM echo Folder %~dp0%oFolder%\ has NOT been created
REM pause

:runTestandWriteFile
echo Starting the test and writing to text file once you hit any key
echo directory about to be made is %~dp0output\%oFolder%\
REM md\%~dp0output\%oFolder%\
echo path is %~dp0output\%oFolder%\%testID%.rtf
pause
mocha test\col > %testID%_DATE.rtf 

:end