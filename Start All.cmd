@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-windows.ps1" %*
set "START_EXIT=%ERRORLEVEL%"
if "%~1"=="" pause
exit /b %START_EXIT%
