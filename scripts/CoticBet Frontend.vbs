' ===========================================================
' CoticBet Frontend Launcher
' ===========================================================
' Este arquivo inicia o frontend na bandeja do sistema
' sem mostrar janelas de terminal
' ===========================================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obter diretório do script
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
psScript = scriptDir & "\start-frontend-tray.ps1"

' Executar PowerShell oculto
command = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & psScript & """"
WshShell.Run command, 0, False

' Limpar objetos
Set WshShell = Nothing
Set fso = Nothing
