@echo off
cd /d "%~dp0"
if not exist node_modules\electron\dist\electron.exe (
  echo Installing Fly Trainer for the first time...
  call npm install
  if errorlevel 1 (
    echo Installation failed. Check the message above.
    pause
    exit /b 1
  )
)
call npm start
if errorlevel 1 pause
