# Criar atalho na área de trabalho para CoticBet Frontend

$WshShell = New-Object -ComObject WScript.Shell
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "CoticBet Frontend.lnk"

$shortcut = $WshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $PSScriptRoot "CoticBet Frontend.vbs"
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Description = "Iniciar CoticBet Frontend na bandeja do sistema"
$shortcut.IconLocation = "C:\Windows\System32\imageres.dll,1" # Ícone de engrenagem
$shortcut.Save()

Write-Host "Atalho criado na área de trabalho: $shortcutPath" -ForegroundColor Green
