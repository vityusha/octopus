@ECHO off

if "%OS%"=="Windows_NT" @setlocal
if "%OS%"=="WINNT" @setlocal

SET SIGNTOOL="c:\Program Files (x86)\Microsoft SDKs\Windows\v7.1A\Bin\signtool.exe"
SET TIMESTAMPSERVER=http://timestamp.globalsign.com/tsa/r6advanced1

%SIGNTOOL% sign /v /a /tr %TIMESTAMPSERVER% /td SHA256 /fd SHA256 out\octopus-win32-x64\octopus.exe
%SIGNTOOL% sign /v /a /tr %TIMESTAMPSERVER% /td SHA256 /fd SHA256 "out\make\squirrel.windows\x64\octopus-1.0.1 Setup.exe" 
 
rem 
rem Old Method 
rem
rem "c:\Program Files (x86)\Microsoft SDKs\Windows\v7.1A\Bin\signtool.exe" sign /f e:\work\Nibelung\cert\dialog-nibelung.ru.pfx /p Hidnorip /t http://timestamp.digicert.com/ /v e:\work\Nibelung\KeyPrint\Release\KeyPrint.exe

if "%OS%"=="Windows_NT" @endlocal
if "%OS%"=="WINNT" @endlocal
