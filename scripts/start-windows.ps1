param(
    [ValidateRange(1024, 65535)][int]$BackendPort = 8010,
    [ValidateRange(1024, 65535)][int]$FrontendPort = 5680,
    [ValidateRange(1024, 65535)][int]$MailpitPort = 8225,
    [string]$RuntimeDirectory = $env:GP2_RUNTIME_DIR,
    [string]$PostgresBin = $env:GP2_POSTGRES_BIN,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$backendUrl = "http://127.0.0.1:$BackendPort"
$frontendUrl = "http://127.0.0.1:$FrontendPort"
$mailpitUrl = "http://127.0.0.1:$MailpitPort"
$started = @()
$lease = $null

function Read-Setting($File, $Name) {
    $entry = Select-String -LiteralPath $File -Pattern "^\s*$Name\s*=" | Select-Object -Last 1
    if ($entry) { return ($entry.Line -split '=', 2)[1].Trim().Trim('"', "'") }
}

function Assert-Setting($File, $Name, $Expected) {
    if ((Read-Setting $File $Name) -ne $Expected) {
        throw "Set $Name=$Expected in $File before starting."
    }
}

function Test-Listener($Port, $EntryPoint, $Executable, $ProcessId) {
    $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    foreach ($listener in $listeners) {
        $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
        if ($listener.LocalAddress -ne '127.0.0.1' -or
            ($ProcessId -and $listener.OwningProcess -ne $ProcessId) -or
            ($Executable -and $owner.ExecutablePath -ne $Executable) -or
            ($EntryPoint -and (!$owner.CommandLine -or
                ($owner.CommandLine.IndexOf($EntryPoint, [StringComparison]::OrdinalIgnoreCase) -lt 0 -and
                 $owner.CommandLine.IndexOf((Split-Path -Leaf $EntryPoint), [StringComparison]::OrdinalIgnoreCase) -lt 0)))) {
            throw "Port $Port is already in use by another service (PID $($listener.OwningProcess)). Free the port or fix the local configuration."
        }
    }
    return ($listeners.Count -gt 0)
}

function Read-LocalPort($File, $Name) {
    $value = 0
    if (![int]::TryParse((Read-Setting $File $Name), [ref]$value) -or $value -lt 1024 -or $value -gt 65535) {
        throw "Set $Name in $File to the provisioned local service port (1024-65535)."
    }
    return $value
}

function Get-PostgresProcessId($DataDirectory, $Port) {
    $pidFile = Join-Path $DataDirectory 'postmaster.pid'
    if (!(Test-Path -LiteralPath $pidFile)) { return $null }
    $metadata = @(Get-Content -LiteralPath $pidFile -TotalCount 4)
    $serverId = 0
    if ($metadata.Count -lt 4 -or ![int]::TryParse($metadata[0], [ref]$serverId) -or $serverId -lt 1) {
        throw "PostgreSQL has an incomplete PID file at $pidFile. Inspect the cluster before starting again."
    }
    if (!(Get-Process -Id $serverId -ErrorAction SilentlyContinue)) { return $null }
    if ([IO.Path]::GetFullPath($metadata[1]) -ne $DataDirectory -or $metadata[3] -ne "$Port") {
        throw "The configured PostgreSQL cluster is already running with different connection settings. Inspect $pidFile."
    }
    return $serverId
}

function Start-Postgres($DataDirectory, $Bin, $Port) {
    $ready = if ($Bin) { Join-Path $Bin 'pg_isready.exe' } else { (Get-Command pg_isready.exe -ErrorAction SilentlyContinue).Source }
    
    # Check if PostgreSQL is already active and accepting connections on this port
    $alreadyAccepting = $false
    if ($ready -and (Test-Path -LiteralPath $ready -PathType Leaf)) {
        & $ready -h 127.0.0.1 -p $Port -t 2 -q
        if ($LASTEXITCODE -eq 0) { $alreadyAccepting = $true }
    } else {
        $tcp = New-Object System.Net.Sockets.TcpClient
        try {
            $tcp.Connect('127.0.0.1', $Port)
            if ($tcp.Connected) { $alreadyAccepting = $true; $tcp.Close() }
        } catch { }
    }

    if ($alreadyAccepting) {
        Write-Host "PostgreSQL is active at 127.0.0.1:$Port"
        return
    }

    # If not running and a local data directory with PG_VERSION exists, start it with pg_ctl
    if ($DataDirectory -and (Test-Path -LiteralPath (Join-Path $DataDirectory 'PG_VERSION') -PathType Leaf)) {
        if (!$Bin) { throw "PostgreSQL bin directory not found. Please set GP2_POSTGRES_BIN or ensure PostgreSQL is in PATH." }
        $ctl = Join-Path $Bin 'pg_ctl.exe'
        $postgres = Join-Path $Bin 'postgres.exe'
        foreach ($program in @($ctl, $postgres)) {
            if (!(Test-Path -LiteralPath $program -PathType Leaf)) {
                throw "PostgreSQL executable missing at $program. Set GP2_POSTGRES_BIN to the matching PostgreSQL bin directory."
            }
        }
        $serverId = Get-PostgresProcessId $DataDirectory $Port
        if ($serverId) {
            $runningProc = Get-Process -Id $serverId -ErrorAction SilentlyContinue
            if (!$runningProc -or $runningProc.Path -ne $postgres) {
                Remove-Item (Join-Path $DataDirectory 'postmaster.pid') -Force -ErrorAction SilentlyContinue
            }
        }
        $postgresLog = Join-Path $logDir 'windows-postgres.log'
        $arguments = 'start -D "{0}" -l "{1}" -o "-h 127.0.0.1 -p {2}" -W' -f $DataDirectory, $postgresLog, $Port
        $null = Start-Server $ctl $arguments $DataDirectory 'pg-ctl'

        $deadline = (Get-Date).AddSeconds(30)
        do {
            if ($ready -and (Test-Path -LiteralPath $ready -PathType Leaf)) {
                & $ready -h 127.0.0.1 -p $Port -t 2 -q
                if ($LASTEXITCODE -eq 0) { break }
            } else {
                $tcp = New-Object System.Net.Sockets.TcpClient
                try {
                    $tcp.Connect('127.0.0.1', $Port)
                    if ($tcp.Connected) { $tcp.Close(); break }
                } catch { }
            }
            Start-Sleep -Milliseconds 400
        } while ((Get-Date) -lt $deadline)

        $serverId = Get-PostgresProcessId $DataDirectory $Port
        Write-Host "PostgreSQL 127.0.0.1:$Port (PID $serverId)"
    } else {
        # Check if a Windows PostgreSQL service is installed
        $svc = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($svc) {
            if ($svc.Status -ne 'Running') {
                Write-Host "Starting PostgreSQL Windows service ($($svc.Name))..."
                Start-Service $svc.Name
                Start-Sleep -Seconds 3
            }
        }
        $tcp = New-Object System.Net.Sockets.TcpClient
        $connected = $false
        try {
            $tcp.Connect('127.0.0.1', $Port)
            if ($tcp.Connected) { $connected = $true; $tcp.Close() }
        } catch { }

        if (!$connected) {
            throw "PostgreSQL at 127.0.0.1:$Port is not accepting connections. Please start your PostgreSQL server or service."
        }
        Write-Host "PostgreSQL is active at 127.0.0.1:$Port"
    }
}

function Start-Mailpit($Executable, $SmtpPort) {
    if (!$Executable) {
        $uiRunning = Test-Listener $MailpitPort
        if ($uiRunning) {
            Write-Host "Mailpit is active at $mailpitUrl"
            return
        }
        Write-Host "Mailpit was not found. Continuing without local email interception." -ForegroundColor Yellow
        return
    }
    $uiRunning = Test-Listener $MailpitPort -Executable $Executable
    $smtpRunning = Test-Listener $SmtpPort -Executable $Executable
    if ($uiRunning -ne $smtpRunning) {
        throw "Mailpit must own both configured ports ($MailpitPort and $SmtpPort). Check the running Mailpit configuration."
    }
    $mailProcess = $null
    if (!$uiRunning) {
        $mailProcess = Start-Server $Executable "--listen 127.0.0.1:$MailpitPort --smtp 127.0.0.1:$SmtpPort" (Split-Path -Parent $Executable) 'mailpit'
        $script:started += $mailProcess
    }
    Wait-ForHttp $mailpitUrl $mailProcess
    $mailId = (Get-NetTCPConnection -LocalPort $MailpitPort -State Listen).OwningProcess
    if (!(Test-Listener $MailpitPort -Executable $Executable -ProcessId $mailId) -or
        !(Test-Listener $SmtpPort -Executable $Executable -ProcessId $mailId)) {
        throw "Mailpit is not listening on both configured ports. Check the Mailpit startup logs."
    }
}

function Wait-ForHttp($Url, $Process) {
    $deadline = (Get-Date).AddSeconds(60)
    do {
        if ($Process -and $Process.HasExited) {
            throw "The server exited while starting $Url. See the startup logs."
        }
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) { return }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    } while ((Get-Date) -lt $deadline)
    throw "$Url did not return HTTP 200. Check the startup logs and the configured database."
}

function Start-Server($Executable, $Arguments, $Directory, $Name) {
    $settings = @{
        FilePath = $Executable
        ArgumentList = $Arguments
        WorkingDirectory = $Directory
        WindowStyle = 'Hidden'
        PassThru = $true
        RedirectStandardOutput = Join-Path $logDir "windows-$Name.out.log"
        RedirectStandardError = Join-Path $logDir "windows-$Name.err.log"
    }
    Start-Process @settings
}

try {
    $backendEnv = Join-Path $backend '.env'
    $frontendEnv = Join-Path $frontend '.env'
    if (!(Test-Path -LiteralPath $backendEnv)) {
        throw 'Configure backend/.env from backend/.env.example and provision its local database before starting.'
    }
    Assert-Setting $backendEnv 'APP_URL' $backendUrl
    Assert-Setting $backendEnv 'APP_FRONTEND_URL' $frontendUrl
    Assert-Setting $backendEnv 'APP_ENV' 'local'
    Assert-Setting $backendEnv 'DB_CONNECTION' 'pgsql'
    Assert-Setting $backendEnv 'DB_HOST' '127.0.0.1'
    $dbDatabase = Read-Setting $backendEnv 'DB_DATABASE'
    if (!$dbDatabase) { throw "Set DB_DATABASE in $backendEnv before starting." }
    Assert-Setting $backendEnv 'MAIL_MAILER' 'smtp'
    Assert-Setting $backendEnv 'MAIL_HOST' '127.0.0.1'
    $databasePort = Read-LocalPort $backendEnv 'DB_PORT'
    $smtpPort = Read-LocalPort $backendEnv 'MAIL_PORT'
    $servicePorts = @($BackendPort, $FrontendPort, $databasePort, $MailpitPort, $smtpPort)
    if (@($servicePorts | Select-Object -Unique).Count -ne $servicePorts.Count) {
        throw 'PostgreSQL, backend, frontend and both Mailpit listeners require different ports.'
    }
    if ((Read-Setting $backendEnv 'DB_URL') -or $env:DB_URL) {
        throw 'Remove the DB_URL override from the launcher environment and use the explicit local DB_* settings in backend/.env.'
    }
    foreach ($name in @('APP_ENV', 'DB_CONNECTION', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'MAIL_MAILER', 'MAIL_HOST', 'MAIL_PORT')) {
        $override = [Environment]::GetEnvironmentVariable($name)
        if ($override -and $override -ne (Read-Setting $backendEnv $name)) {
            throw "The shell overrides $name in backend/.env. Clear the shell override before starting the local stack."
        }
    }
    if (!$RuntimeDirectory) {
        if ($env:GP2_RUNTIME_DIR) {
            $RuntimeDirectory = $env:GP2_RUNTIME_DIR
        } elseif (Test-Path -LiteralPath (Join-Path $env:TEMP 'iu-gp2-audit-20261120')) {
            $RuntimeDirectory = Join-Path $env:TEMP 'iu-gp2-audit-20261120'
        } else {
            $RuntimeDirectory = Join-Path $env:TEMP 'iu-events-runtime'
        }
    }
    $clusterDirectory = Join-Path $RuntimeDirectory 'pgdata'
    $clusterVersionFile = Join-Path $clusterDirectory 'PG_VERSION'
    if (!(Test-Path -LiteralPath $clusterVersionFile -PathType Leaf)) {
        $clusterDirectory = $null
    } else {
        $clusterDirectory = (Get-Item -LiteralPath $clusterDirectory).FullName
    }

    if (!$PostgresBin) {
        if ($env:GP2_POSTGRES_BIN -and (Test-Path -LiteralPath $env:GP2_POSTGRES_BIN)) {
            $PostgresBin = $env:GP2_POSTGRES_BIN
        } elseif ($clusterDirectory) {
            $clusterVersion = (Get-Content -LiteralPath $clusterVersionFile -TotalCount 1).Trim()
            $candidate = Join-Path $env:ProgramFiles "PostgreSQL/$clusterVersion/bin"
            if (Test-Path -LiteralPath $candidate) { $PostgresBin = $candidate }
        }
        if (!$PostgresBin) {
            $psqlCmd = Get-Command psql.exe -ErrorAction SilentlyContinue
            if ($psqlCmd) {
                $PostgresBin = Split-Path -Parent $psqlCmd.Source
            } else {
                $pgBins = @(Get-ChildItem -Path (Join-Path $env:ProgramFiles "PostgreSQL") -Filter "bin" -Recurse -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
                if ($pgBins.Count -gt 0) { $PostgresBin = $pgBins[-1] }
            }
        }
    }
    if ($PostgresBin) { $PostgresBin = (Resolve-Path -LiteralPath $PostgresBin).Path }

    $mailpitCandidates = @(
        $env:GP2_MAILPIT_PATH,
        (Join-Path $RuntimeDirectory 'mailpit/mailpit.exe'),
        (Join-Path $root 'tools/mailpit.exe'),
        (Join-Path $root 'tools/mailpit/mailpit.exe'),
        (Join-Path $env:TEMP 'iu-gp2-audit-20261120/mailpit/mailpit.exe'),
        ((Get-Command mailpit.exe -ErrorAction SilentlyContinue).Source)
    ) | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Leaf) }

    $mailpit = if ($mailpitCandidates.Count -gt 0) { (Resolve-Path -LiteralPath $mailpitCandidates[0]).Path } else { $null }

    foreach ($setting in @('APP_KEY', 'JWT_SECRET')) {
        if (!(Read-Setting $backendEnv $setting)) { throw "Configure $setting in backend/.env before starting." }
    }

    $logDir = Join-Path $backend 'storage/logs'
    try {
        $lease = [IO.File]::Open((Join-Path $logDir 'windows-startup.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    } catch {
        throw "Cannot acquire the startup lock in $logDir. Wait for the other launch to finish or check access to that directory."
    }
    if (!(Test-Path -LiteralPath $frontendEnv)) {
        $stream = [IO.File]::Open($frontendEnv, 'CreateNew', 'Write', 'None')
        try {
            $writer = New-Object IO.StreamWriter($stream)
            try {
                $writer.WriteLine("VITE_API_URL_CLIENT=$backendUrl")
                $writer.WriteLine("VITE_API_URL_SERVER=$backendUrl")
                $writer.WriteLine("VITE_FRONTEND_URL=$frontendUrl")
            } finally { $writer.Dispose() }
        } finally { $stream.Dispose() }
    }
    Assert-Setting $frontendEnv 'VITE_API_URL_CLIENT' $backendUrl
    Assert-Setting $frontendEnv 'VITE_API_URL_SERVER' $backendUrl
    Assert-Setting $frontendEnv 'VITE_FRONTEND_URL' $frontendUrl

    $phpCmd = Get-Command php.exe -ErrorAction SilentlyContinue
    if (!$phpCmd) { throw "PHP is required but was not found in PATH. Install PHP >= 8.3 and ensure php.exe is in your PATH." }
    $php = $phpCmd.Source

    $nodeCmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if (!$nodeCmd) { throw "Node.js is required but was not found in PATH. Install Node.js >= 18 and ensure node.exe is in your PATH." }
    $node = $nodeCmd.Source
    $router = Join-Path $backend 'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php'
    $entryPoint = Join-Path $frontend 'server.js'
    if (!(Test-Path -LiteralPath $router)) { throw 'Run composer install in backend before starting.' }
    if (!(Test-Path -LiteralPath (Join-Path $frontend 'node_modules/vite/package.json'))) {
        throw 'Install frontend dependencies before starting.'
    }
    $backendRunning = Test-Listener $BackendPort -EntryPoint $router -Executable $php
    $frontendRunning = Test-Listener $FrontendPort -EntryPoint $entryPoint -Executable $node

    Start-Postgres $clusterDirectory $PostgresBin $databasePort
    Start-Mailpit $mailpit $smtpPort

    $backendProcess = $null
    if (!$backendRunning) {
        $backendProcess = Start-Server $php ('-S 127.0.0.1:{0} "{1}"' -f $BackendPort, $router) (Join-Path $backend 'public') 'backend'
        $started += $backendProcess
    }
    Wait-ForHttp "$backendUrl/public/events" $backendProcess

    $frontendProcess = $null
    if (!$frontendRunning) {
        $env:NODE_ENV = 'development'
        $env:NODE_HOST = '127.0.0.1'
        $frontendProcess = Start-Server $node ('--import ./instrument.mjs "{0}" --port {1}' -f $entryPoint, $FrontendPort) $frontend 'frontend'
        $started += $frontendProcess
    }
    Wait-ForHttp $frontendUrl $frontendProcess

    Write-Host "Frontend $frontendUrl"
    Write-Host "Backend  $backendUrl"
    Write-Host "Mailpit  $mailpitUrl"
    Write-Host "Logs     $logDir"
    if (!$NoBrowser) { Start-Process $frontendUrl }
} catch {
    foreach ($server in $started) {
        if (!$server.HasExited) { Stop-Process -InputObject $server -ErrorAction SilentlyContinue }
    }
    Write-Error $_ -ErrorAction Continue
    exit 1
} finally {
    if ($lease) { $lease.Dispose() }
}
