Set WshShell = CreateObject("WScript.Shell")
' Executa o servidor Next.js em segundo plano (oculto, sem janela preta)
WshShell.CurrentDirectory = "C:\Users\gonca\Documents\GitHub\Nutri"
WshShell.Run "powershell.exe -WindowStyle Hidden -Command ""$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User'); npm run start""", 0, False
WScript.Sleep 2000
WshShell.Run "msedge.exe --app=http://localhost:3000", 1, False
