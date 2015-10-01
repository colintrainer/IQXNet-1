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

REM Get the datetime in a format that can go in a filename.
set _my_datetime=%date%_%time%
set _my_datetime=%_my_datetime: =_%
set _my_datetime=%_my_datetime::=%
set _my_datetime=%_my_datetime:/=_%
set _my_datetime=%_my_datetime:.=_%

:determineOutputFolder
set /p oFolder="Enter Output Folder Name: "
REM Get Full Path
REM echo About to check if %~dp0output\%oFolder% exists
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
REM echo Starting the test and writing to text file once you hit any key
REM md\%~dp0output\%oFolder%\
Echo Report file %testID%_%_my_datetime%.rtf has been created under test\col.
mocha test\col > %testID%_%_my_datetime%.rtf 

:end