:: ====================================== 
:: Batch File to run Mocha Test Scripts
:: Colin Trainer
:: 16/09/2015
:: ======================================

@echo off
:start
set /p testID="Enter Name of Test: "
REM echo % testID%

:determineOutputFolder
set /p oFolder="Enter Output Folder Name: "
REM Get Full Path
REM echo %~dp0
REM pause
echo About to check if %~dp0output\%oFolder% exists
pause
IF EXIST %~dp0output\%oFolder%\ goto folderExistsContinue else goto createNewFolder 

:createNewFolder
rem echo %~dp0%oFolder%\
echo About to create new folder %~dp0output\%oFolder%
pause
cd\%~dp0output\%oFolder%
md\%oFolder% 
goto folderExistsContinue

:folderExistsContinue
echo Starting folderExistsContinue
echo The folder and file being written to are;
echo %~dp0\output\%oFolder%\%testID%.txt
rem echo Path to check for existence is %~dp0%oFolder%
rem IF EXIST %~dp0%oFolder%\ goto folderCreated else goto folderNotCreated
pause

:folderCreated
echo Starting folderCreated
echo Folder %~dp0%oFolder%\ has been created
pause
goto runTestandWriteFile

:folderNotCreated
echo Starting folderNotCreated
echo Folder %~dp0%oFolder%\ has NOT been created
pause

:runTestandWriteFile
echo Starting the test and writing to text file once you hit any key
pause
mocha test\col >> %~dp0%oFolder%\%oFolder%\%testID%.txt
:end