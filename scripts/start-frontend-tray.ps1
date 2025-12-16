# ===========================================================
# CoticBet Frontend - System Tray Runner
# ===========================================================
# Este script executa o frontend (npm run dev) em background
# e cria um ícone na bandeja do sistema para controle
# ===========================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Variáveis globais
$script:npmProcess = $null
$script:projectPath = Split-Path -Parent $PSScriptRoot
$script:isRunning = $false

# Detectar caminho do npm
$npmPath = $null
try {
    $npmPath = (Get-Command npm -ErrorAction Stop).Source
} catch {
    # Tentar caminhos comuns
    $commonPaths = @(
        "$env:ProgramFiles\nodejs\npm.cmd",
        "$env:APPDATA\npm\npm.cmd",
        "${env:ProgramFiles(x86)}\nodejs\npm.cmd"
    )
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $npmPath = $path
            break
        }
    }
}

if (-not $npmPath) {
    [System.Windows.Forms.MessageBox]::Show(
        "npm não encontrado! Instale o Node.js primeiro.`n`nhttps://nodejs.org",
        "Erro - npm não encontrado",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    )
    exit
}

# Configuração
$appName = "CoticBet Frontend"
$npmCommand = $npmPath
$npmArgs = "run", "dev"

# Criar ícone da bandeja
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon

# Criar ícone (bolinha verde/vermelha)
function Create-Icon {
    param([string]$color)

    $bitmap = New-Object System.Drawing.Bitmap 16, 16
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    if ($color -eq "green") {
        $brush = [System.Drawing.Brushes]::LimeGreen
    } else {
        $brush = [System.Drawing.Brushes]::Red
    }

    $graphics.FillEllipse($brush, 2, 2, 12, 12)
    $graphics.Dispose()

    $icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
    return $icon
}

# Iniciar npm run dev
function Start-Frontend {
    if ($script:isRunning) {
        [System.Windows.Forms.MessageBox]::Show("Frontend já está rodando!", $appName, [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
        return
    }

    try {
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "cmd.exe"
        $processInfo.Arguments = "/c cd /d `"$($script:projectPath)`" && npm run dev"
        $processInfo.WorkingDirectory = $script:projectPath
        $processInfo.UseShellExecute = $false
        $processInfo.CreateNoWindow = $true
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true

        $script:npmProcess = [System.Diagnostics.Process]::Start($processInfo)
        $script:isRunning = $true

        # Mudar ícone para verde
        $notifyIcon.Icon = Create-Icon "green"
        $notifyIcon.Text = "$appName - Rodando (PID: $($script:npmProcess.Id))`nhttp://localhost:3000"

        # Mostrar notificação
        $notifyIcon.BalloonTipTitle = $appName
        $notifyIcon.BalloonTipText = "Frontend iniciado com sucesso!`nAcesse: http://localhost:3000"
        $notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
        $notifyIcon.ShowBalloonTip(3000)

        # Atualizar menu
        Update-ContextMenu

    } catch {
        [System.Windows.Forms.MessageBox]::Show("Erro ao iniciar frontend:`n$_", $appName, [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
    }
}

# Parar npm run dev
function Stop-Frontend {
    if (-not $script:isRunning) {
        [System.Windows.Forms.MessageBox]::Show("Frontend não está rodando!", $appName, [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
        return
    }

    try {
        if ($script:npmProcess -and -not $script:npmProcess.HasExited) {
            # Matar processo e filhos
            $processId = $script:npmProcess.Id
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue

            # Matar processos Node.js relacionados
            Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
                $_.StartTime -gt $script:npmProcess.StartTime.AddSeconds(-5)
            } | Stop-Process -Force -ErrorAction SilentlyContinue
        }

        $script:isRunning = $false
        $script:npmProcess = $null

        # Mudar ícone para vermelho
        $notifyIcon.Icon = Create-Icon "red"
        $notifyIcon.Text = "$appName - Parado"

        # Mostrar notificação
        $notifyIcon.BalloonTipTitle = $appName
        $notifyIcon.BalloonTipText = "Frontend parado com sucesso!"
        $notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Warning
        $notifyIcon.ShowBalloonTip(2000)

        # Atualizar menu
        Update-ContextMenu

    } catch {
        [System.Windows.Forms.MessageBox]::Show("Erro ao parar frontend:`n$_", $appName, [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
    }
}

# Abrir browser
function Open-Browser {
    Start-Process "http://172.25.10.34:3000"
}

# Sair da aplicação
function Exit-App {
    if ($script:isRunning) {
        $result = [System.Windows.Forms.MessageBox]::Show(
            "Frontend está rodando. Deseja parar e sair?",
            $appName,
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Question
        )

        if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
            Stop-Frontend
            Start-Sleep -Milliseconds 500
        } else {
            return
        }
    }

    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    [System.Windows.Forms.Application]::Exit()
}

# Criar menu de contexto
function Update-ContextMenu {
    $contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

    # Status
    $statusItem = New-Object System.Windows.Forms.ToolStripMenuItem
    $statusItem.Text = if ($script:isRunning) { "● Rodando" } else { "○ Parado" }
    $statusItem.Enabled = $false
    $contextMenu.Items.Add($statusItem) | Out-Null

    $contextMenu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    # Iniciar/Parar
    if ($script:isRunning) {
        $stopItem = New-Object System.Windows.Forms.ToolStripMenuItem
        $stopItem.Text = "⏹️ Parar Frontend"
        $stopItem.Add_Click({ Stop-Frontend })
        $contextMenu.Items.Add($stopItem) | Out-Null
    } else {
        $startItem = New-Object System.Windows.Forms.ToolStripMenuItem
        $startItem.Text = "▶️ Iniciar Frontend"
        $startItem.Add_Click({ Start-Frontend })
        $contextMenu.Items.Add($startItem) | Out-Null
    }

    # Abrir no browser
    $browserItem = New-Object System.Windows.Forms.ToolStripMenuItem
    $browserItem.Text = "🛜 Abrir no Browser"
    $browserItem.Add_Click({ Open-Browser })
    $contextMenu.Items.Add($browserItem) | Out-Null

    $contextMenu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator)) | Out-Null

    # Sair
    $exitItem = New-Object System.Windows.Forms.ToolStripMenuItem
    $exitItem.Text = "❌ Sair"
    $exitItem.Add_Click({ Exit-App })
    $contextMenu.Items.Add($exitItem) | Out-Null

    $notifyIcon.ContextMenuStrip = $contextMenu
}

# Configurar ícone inicial
$notifyIcon.Icon = Create-Icon "red"
$notifyIcon.Text = "$appName - Parado"
$notifyIcon.Visible = $true

# Evento de duplo clique - alternar iniciar/parar
$notifyIcon.Add_DoubleClick({
    if ($script:isRunning) {
        Stop-Frontend
    } else {
        Start-Frontend
    }
})

# Criar menu inicial
Update-ContextMenu

# Iniciar automaticamente ao abrir
Start-Frontend

# Manter aplicação rodando
[System.Windows.Forms.Application]::Run()
