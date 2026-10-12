@echo off
title Nutritionist Management App
cd /d "%~dp0"
echo Iniciando Nutritionist Management...
start msedge.exe --app=http://localhost:3000
if %errorlevel% neq 0 (
  start chrome.exe --app=http://localhost:3000
)
exit
