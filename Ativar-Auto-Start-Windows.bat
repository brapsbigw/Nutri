@echo off
set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%_create_shortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\NutritionistManagement.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "C:\Users\gonca\Documents\GitHub\Nutri\Iniciar-Servidor-Sempre-On.vbs" >> %SCRIPT%
echo oLink.WorkingDirectory = "C:\Users\gonca\Documents\GitHub\Nutri" >> %SCRIPT%
echo oLink.Description = "Iniciar Nutritionist Management automaticamente" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%
cscript /nologo %SCRIPT%
del %SCRIPT%
echo Atalho configurado com sucesso no arranque do Windows!
pause
