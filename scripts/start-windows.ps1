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
$tools = Join-Path $root 'tools'
$backendUrl = "http://127.0.0.1:$BackendPort"
$frontendUrl = "http://127.0.0.1:$FrontendPort"
$mailpitUrl = "http://127.0.0.1:$MailpitPort"
$started = @()
$lease = $null

function Write-Step($Message) {
    Write-Host "[IU Events Setup] $Message" -ForegroundColor Cyan
}

function Write-Success($Message) {
    Write-Host "[IU Events] $Message" -ForegroundColor Green
}

function Write-WarningMsg($Message) {
    Write-Host "[IU Events Warning] $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg($Message) {
    Write-Host "[IU Events Error] $Message" -ForegroundColor Red
}

function Refresh-Path {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

function Read-Setting($File, $Name) {
    if (!(Test-Path -LiteralPath $File)) { return $null }
    $entry = Select-String -LiteralPath $File -Pattern "^\s*$Name\s*=" | Select-Object -Last 1
    if ($entry) { return ($entry.Line -split '=', 2)[1].Trim().Trim('"', "'") }
    return $null
}

function Set-Setting($File, $Name, $Value) {
    if (!(Test-Path -LiteralPath $File)) {
        Set-Content -LiteralPath $File -Value "$Name=$Value" -Encoding UTF8
        return
    }
    $content = @(Get-Content -LiteralPath $File)
    $found = $false
    $newContent = foreach ($line in $content) {
        if ($line -match "^\s*$Name\s*=") {
            $found = $true
            "$Name=$Value"
        }
        else {
            $line
        }
    }
    if (!$found) {
        $newContent += "$Name=$Value"
    }
    Set-Content -LiteralPath $File -Value $newContent -Encoding UTF8
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
            return $false
        }
    }
    return ($listeners.Count -gt 0)
}

function Read-LocalPort($File, $Name, $Default = 0) {
    $value = 0
    $raw = Read-Setting $File $Name
    if (![int]::TryParse($raw, [ref]$value) -or $value -lt 1024 -or $value -gt 65535) {
        if ($Default -ge 1024 -and $Default -le 65535) {
            Set-Setting $File $Name $Default
            return $Default
        }
        throw "Set $Name in $File to the provisioned local service port (1024-65535)."
    }
    return $value
}

function Ensure-Node {
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if (!$cmd) {
        Refresh-Path
        $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    }
    if (!$cmd) {
        $candidates = @(
            (Join-Path $env:ProgramFiles "nodejs\node.exe"),
            (Join-Path ${env:ProgramFiles(x86)} "nodejs\node.exe"),
            (Join-Path $env:LOCALAPPDATA "Programs\node\node.exe")
        )
        foreach ($c in $candidates) {
            if ($c -and (Test-Path -LiteralPath $c -PathType Leaf)) {
                $env:Path = (Split-Path -Parent $c) + ";" + $env:Path
                $cmd = Get-Command $c -ErrorAction SilentlyContinue
                break
            }
        }
    }
    if (!$cmd) {
        Write-Step "Node.js not detected. Installing Node.js LTS via winget..."
        try {
            Start-Process winget -ArgumentList "install OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements" -Wait -NoNewWindow
            Refresh-Path
            $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
        }
        catch { }
    }
    if (!$cmd) {
        throw "Node.js >= 18 is required. Please install Node.js from https://nodejs.org/ and re-run."
    }
    Write-Success "Node.js is ready: $($cmd.Source)"
    return $cmd.Source
}

function Ensure-Php {
    $cmd = Get-Command php.exe -ErrorAction SilentlyContinue
    if (!$cmd) {
        Refresh-Path
        $cmd = Get-Command php.exe -ErrorAction SilentlyContinue
    }
    if (!$cmd) {
        $candidates = @(
            (Get-ChildItem -Path (Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages") -Filter "php.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName),
            "C:\php\php.exe",
            "C:\tools\php\php.exe"
        )
        foreach ($c in $candidates) {
            if ($c -and (Test-Path -LiteralPath $c -PathType Leaf)) {
                $env:Path = (Split-Path -Parent $c) + ";" + $env:Path
                $cmd = Get-Command $c -ErrorAction SilentlyContinue
                break
            }
        }
    }
    if (!$cmd) {
        Write-Step "PHP not detected. Installing PHP 8.4 via winget..."
        try {
            Start-Process winget -ArgumentList "install PHP.PHP.8.4 -e --silent --accept-package-agreements --accept-source-agreements" -Wait -NoNewWindow
            Refresh-Path
            $cmd = Get-Command php.exe -ErrorAction SilentlyContinue
        }
        catch { }
    }
    if (!$cmd) {
        throw "PHP >= 8.3 is required. Please install PHP from https://windows.php.net/download/ and re-run."
    }
    Write-Success "PHP is ready: $($cmd.Source)"
    return $cmd.Source
}

function Ensure-PhpExtensions($php) {
    $modules = @(& $php -m 2>$null)
    $requiredExtensions = @('pdo_pgsql', 'curl', 'gd', 'intl', 'mbstring', 'openssl', 'zip', 'bcmath', 'fileinfo')
    $missing = @($requiredExtensions | Where-Object { $modules -notcontains $_ })
    if ($missing.Count -eq 0) { return }

    Write-Step "Enabling required PHP extensions: $($missing -join ', ')..."
    $phpDir = Split-Path -Parent $php
    $iniFile = Join-Path $phpDir 'php.ini'
    if (!(Test-Path -LiteralPath $iniFile)) {
        $devIni = Join-Path $phpDir 'php.ini-development'
        $prodIni = Join-Path $phpDir 'php.ini-production'
        if (Test-Path -LiteralPath $devIni) {
            Copy-Item $devIni $iniFile
        }
        elseif (Test-Path -LiteralPath $prodIni) {
            Copy-Item $prodIni $iniFile
        }
        else {
            Set-Content -LiteralPath $iniFile -Value "[PHP]`nextension_dir = ""ext""" -Encoding UTF8
        }
    }
    if (Test-Path -LiteralPath $iniFile) {
        $iniContent = Get-Content -LiteralPath $iniFile -Raw
        if ($iniContent -match ';?\s*extension_dir\s*=\s*"ext"') {
            $iniContent = $iniContent -replace ';?\s*extension_dir\s*=\s*"ext"', 'extension_dir = "ext"'
        }
        foreach ($ext in $missing) {
            if ($iniContent -match ";?\s*extension\s*=\s*$ext") {
                $iniContent = $iniContent -replace ";?\s*extension\s*=\s*$ext", "extension=$ext"
            }
            else {
                $iniContent += "`nextension=$ext"
            }
        }
        Set-Content -LiteralPath $iniFile -Value $iniContent -Encoding UTF8
    }
}

function Ensure-Composer($php) {
    $cmd = Get-Command composer.bat -ErrorAction SilentlyContinue
    if (!$cmd) { $cmd = Get-Command composer.exe -ErrorAction SilentlyContinue }
    if (!$cmd) {
        if (!(Test-Path -LiteralPath $tools)) {
            New-Item -ItemType Directory -Path $tools -Force | Out-Null
        }
        $composerPhar = Join-Path $tools 'composer.phar'
        if (!(Test-Path -LiteralPath $composerPhar -PathType Leaf)) {
            Write-Step "Downloading portable Composer (composer.phar)..."
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
            Invoke-WebRequest -Uri "https://getcomposer.org/download/latest-stable/composer.phar" -OutFile $composerPhar -UseBasicParsing
        }
        Write-Success "Composer (portable) is ready."
    }
    else {
        Write-Success "Composer is ready: $($cmd.Source)"
    }
}

function Invoke-ComposerApp($php, [string[]]$Arguments) {
    $composerCmd = Get-Command composer.bat -ErrorAction SilentlyContinue
    if (!$composerCmd) { $composerCmd = Get-Command composer.exe -ErrorAction SilentlyContinue }
    if ($composerCmd) {
        & $composerCmd.Source @Arguments
    }
    else {
        $composerPhar = Join-Path $tools 'composer.phar'
        & $php $composerPhar @Arguments
    }
}

function Ensure-EnvironmentFiles($php, $backendUrl, $frontendUrl, $BackendPort, $FrontendPort) {
    $backendEnv = Join-Path $backend '.env'
    $backendEnvExample = Join-Path $backend '.env.example'
    $frontendEnv = Join-Path $frontend '.env'

    if (!(Test-Path -LiteralPath $backendEnv)) {
        Write-Step "Creating backend/.env from .env.example..."
        if (Test-Path -LiteralPath $backendEnvExample) {
            Copy-Item $backendEnvExample $backendEnv
        }
        else {
            Set-Content -LiteralPath $backendEnv -Value "APP_NAME=`"IU Events Management Platform`"`nAPP_ENV=local" -Encoding UTF8
        }
    }

    Set-Setting $backendEnv 'APP_URL' $backendUrl
    Set-Setting $backendEnv 'APP_PORT' $BackendPort
    Set-Setting $backendEnv 'APP_FRONTEND_URL' $frontendUrl
    Set-Setting $backendEnv 'APP_ENV' 'local'
    Set-Setting $backendEnv 'DB_CONNECTION' 'pgsql'
    Set-Setting $backendEnv 'DB_HOST' '127.0.0.1'
    Set-Setting $backendEnv 'FILESYSTEM_PUBLIC_DISK' 'public'
    Set-Setting $backendEnv 'FILESYSTEM_PRIVATE_DISK' 'local'
    Set-Setting $backendEnv 'APP_CDN_URL' "$backendUrl/storage"
    if (!(Read-Setting $backendEnv 'DB_PORT')) { Set-Setting $backendEnv 'DB_PORT' '5432' }
    if (!(Read-Setting $backendEnv 'DB_DATABASE')) { Set-Setting $backendEnv 'DB_DATABASE' 'iu_events' }
    if (!(Read-Setting $backendEnv 'DB_USERNAME')) { Set-Setting $backendEnv 'DB_USERNAME' 'postgres' }
    if ($null -eq (Read-Setting $backendEnv 'APP_KEY')) { Set-Setting $backendEnv 'APP_KEY' '' }
    Set-Setting $backendEnv 'MAIL_MAILER' 'smtp'
    Set-Setting $backendEnv 'MAIL_HOST' '127.0.0.1'
    if (!(Read-Setting $backendEnv 'MAIL_PORT')) { Set-Setting $backendEnv 'MAIL_PORT' '1025' }

    if (!(Test-Path -LiteralPath $frontendEnv)) {
        Write-Step "Creating frontend/.env..."
        $frontendLines = @(
            "VITE_API_URL_CLIENT=$backendUrl",
            "VITE_API_URL_SERVER=$backendUrl",
            "VITE_FRONTEND_URL=$frontendUrl"
        )
        Set-Content -LiteralPath $frontendEnv -Value $frontendLines -Encoding UTF8
    }
    else {
        Set-Setting $frontendEnv 'VITE_API_URL_CLIENT' $backendUrl
        Set-Setting $frontendEnv 'VITE_API_URL_SERVER' $backendUrl
        Set-Setting $frontendEnv 'VITE_FRONTEND_URL' $frontendUrl
    }
}

function Ensure-BackendDependencies($php) {
    $autoload = Join-Path $backend 'vendor/autoload.php'
    if (!(Test-Path -LiteralPath $autoload)) {
        Write-Step "Installing backend dependencies (composer install)... This may take 1-3 minutes."
        Push-Location $backend
        try {
            Invoke-ComposerApp $php @('install', '--no-interaction', '--prefer-dist')
        }
        finally {
            Pop-Location
        }
        Write-Success "Backend dependencies installed successfully."
    }
}

function Ensure-LaravelKeysAndStorage($php) {
    $backendEnv = Join-Path $backend '.env'
    $appKey = Read-Setting $backendEnv 'APP_KEY'
    if (!$appKey -or $appKey -eq '') {
        Write-Step "Generating Laravel APP_KEY..."
        Push-Location $backend
        try {
            & $php artisan key:generate --force
        }
        finally {
            Pop-Location
        }
    }

    $jwtSecret = Read-Setting $backendEnv 'JWT_SECRET'
    if (!$jwtSecret -or $jwtSecret -eq '') {
        Write-Step "Generating JWT_SECRET..."
        Push-Location $backend
        try {
            & $php artisan jwt:secret --force 2>$null
        }
        catch { }
        Pop-Location
        $jwtSecret = Read-Setting $backendEnv 'JWT_SECRET'
        if (!$jwtSecret -or $jwtSecret -eq '') {
            $bytes = New-Object byte[] 32
            (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
            $generatedKey = [Convert]::ToBase64String($bytes)
            Set-Setting $backendEnv 'JWT_SECRET' $generatedKey
        }
    }

    $storageLink = Join-Path $backend 'public/storage'
    if (!(Test-Path -LiteralPath $storageLink)) {
        Push-Location $backend
        try {
            & $php artisan storage:link 2>$null
        }
        catch { }
        finally {
            Pop-Location
        }
    }
}

function Ensure-DatabaseAndMigrations($php, $databasePort) {
    $backendEnv = Join-Path $backend '.env'
    $dbUser = Read-Setting $backendEnv 'DB_USERNAME'
    if (!$dbUser) { $dbUser = 'postgres' }
    $dbName = Read-Setting $backendEnv 'DB_DATABASE'
    if (!$dbName) { $dbName = 'iu_events' }
    $currentPwd = Read-Setting $backendEnv 'DB_PASSWORD'

    Write-Step "Verifying PostgreSQL database connection and database '$dbName'..."
    $dbScript = Join-Path $root 'scripts/setup-database.php'
    $rawResult = & $php $dbScript $databasePort $dbUser $currentPwd $dbName
    try {
        $dbInfo = $rawResult | ConvertFrom-Json
        if ($dbInfo.status -eq 'ok') {
            Set-Setting $backendEnv 'DB_PASSWORD' $dbInfo.password
            Write-Success $dbInfo.message
        }
        else {
            Write-WarningMsg $dbInfo.message
        }
    }
    catch {
        Write-WarningMsg "Could not parse database status: $rawResult"
    }

    Write-Step "Running database migrations..."
    Push-Location $backend
    try {
        & $php artisan migrate --force

        # Check if database has 0 events, and automatically seed the 8 official committee events
        $eventCount = & $php -r "require 'vendor/autoload.php'; `$app = require_once 'bootstrap/app.php'; `$kernel = `$app->make(Illuminate\Contracts\Console\Kernel::class); `$kernel->bootstrap(); echo DB::table('events')->whereNull('deleted_at')->count();" 2>$null
        if ($eventCount -eq '0') {
            Write-Step "Seeding official graduation project events (8 curated events)..."
            $organizerCount = & $php -r "require 'vendor/autoload.php'; `$app = require_once 'bootstrap/app.php'; `$kernel = `$app->make(Illuminate\Contracts\Console\Kernel::class); `$kernel->bootstrap(); echo DB::table('organizers')->where('id', 1)->count();" 2>$null
            if ($organizerCount -eq '0') {
                "Password123456!" | & $php artisan gp2:provision-organizer "admin@iu.edu.sa" --first-name="إدارة" --last-name="الفعاليات" --organizer="عمادة شؤون الطلاب - الجامعة الإسلامية" --locale=ar --password-stdin
            }
            & $php artisan gp2:seed-committee --organizer-id=1 --apply
            Write-Success "Official graduation project events seeded successfully."
        }
    }
    finally {
        Pop-Location
    }
    Write-Success "Database migrations completed."
}

function Ensure-FrontendDependencies {
    $vitePkg = Join-Path $frontend 'node_modules/vite/package.json'
    if (!(Test-Path -LiteralPath $vitePkg)) {
        Write-Step "Installing frontend dependencies (npm install --legacy-peer-deps)... This may take 1-3 minutes."
        Push-Location $frontend
        try {
            cmd.exe /c npm install --legacy-peer-deps
        }
        finally {
            Pop-Location
        }
        Write-Success "Frontend dependencies installed successfully."
    }
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

    $alreadyAccepting = $false
    if ($ready -and (Test-Path -LiteralPath $ready -PathType Leaf)) {
        & $ready -h 127.0.0.1 -p $Port -t 2 -q
        if ($LASTEXITCODE -eq 0) { $alreadyAccepting = $true }
    }
    else {
        $tcp = New-Object System.Net.Sockets.TcpClient
        try {
            $tcp.Connect('127.0.0.1', $Port)
            if ($tcp.Connected) { $alreadyAccepting = $true; $tcp.Close() }
        }
        catch { }
    }

    if ($alreadyAccepting) {
        Write-Host "PostgreSQL is active at 127.0.0.1:$Port"
        return
    }

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
            }
            else {
                $tcp = New-Object System.Net.Sockets.TcpClient
                try {
                    $tcp.Connect('127.0.0.1', $Port)
                    if ($tcp.Connected) { $tcp.Close(); break }
                }
                catch { }
            }
            Start-Sleep -Milliseconds 400
        } while ((Get-Date) -lt $deadline)

        $serverId = Get-PostgresProcessId $DataDirectory $Port
        Write-Host "PostgreSQL 127.0.0.1:$Port (PID $serverId)"
    }
    else {
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
        }
        catch { }

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

    if ($uiRunning -and !$smtpRunning) {
        Write-WarningMsg "Mailpit port mismatch detected. Restarting Mailpit on ports $MailpitPort and $SmtpPort..."
        $oldPids = @((Get-NetTCPConnection -LocalPort $MailpitPort -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique)
        foreach ($p in $oldPids) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Milliseconds 600
        $uiRunning = $false
        $smtpRunning = $false
    }

    $mailProcess = $null
    if (!$uiRunning) {
        $mailProcess = Start-Server $Executable "--listen 127.0.0.1:$MailpitPort --smtp 127.0.0.1:$SmtpPort" (Split-Path -Parent $Executable) 'mailpit'
        $script:started += $mailProcess
    }
    Wait-ForHttp $mailpitUrl $mailProcess
    Write-Success "Mailpit is active at $mailpitUrl (SMTP: 127.0.0.1:$SmtpPort)"
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
        }
        catch {
            Start-Sleep -Milliseconds 500
        }
    } while ((Get-Date) -lt $deadline)
    throw "$Url did not return HTTP 200. Check the startup logs and the configured database."
}

function Start-Server($Executable, $Arguments, $Directory, $Name) {
    $settings = @{
        FilePath               = $Executable
        ArgumentList           = $Arguments
        WorkingDirectory       = $Directory
        WindowStyle            = 'Hidden'
        PassThru               = $true
        RedirectStandardOutput = Join-Path $logDir "windows-$Name.out.log"
        RedirectStandardError  = Join-Path $logDir "windows-$Name.err.log"
    }
    Start-Process @settings
}

try {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   IU Events Management Platform - One-Click Launcher     " -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""

    # Phase 1: Environment & Tools Detection
    $node = Ensure-Node
    $php = Ensure-Php
    Ensure-PhpExtensions $php
    Ensure-Composer $php

    $backendEnv = Join-Path $backend '.env'
    $frontendEnv = Join-Path $frontend '.env'

    Ensure-EnvironmentFiles $php $backendUrl $frontendUrl $BackendPort $FrontendPort

    $databasePort = Read-LocalPort $backendEnv 'DB_PORT' 5432
    $smtpPort = Read-LocalPort $backendEnv 'MAIL_PORT' 1025

    # Phase 2: Dependencies Installation
    Ensure-BackendDependencies $php
    Ensure-LaravelKeysAndStorage $php

    # Phase 3: Database & Migrations
    Ensure-DatabaseAndMigrations $php $databasePort

    # Phase 4: Frontend Dependencies
    Ensure-FrontendDependencies

    # Phase 5: Servers Launch
    $logDir = Join-Path $backend 'storage/logs'
    if (!(Test-Path -LiteralPath $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }

    try {
        $lease = [IO.File]::Open((Join-Path $logDir 'windows-startup.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    }
    catch {
        throw "Cannot acquire the startup lock in $logDir. Wait for the other launch to finish or check access to that directory."
    }

    $router = Join-Path $backend 'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php'
    $entryPoint = Join-Path $frontend 'server.js'

    if (!(Test-Path -LiteralPath $router)) {
        throw 'Backend router not found in vendor. Please run composer install.'
    }

    $backendRunning = Test-Listener $BackendPort -EntryPoint $router -Executable $php
    $frontendRunning = Test-Listener $FrontendPort -EntryPoint $entryPoint -Executable $node

    if (!$RuntimeDirectory) {
        if ($env:GP2_RUNTIME_DIR) {
            $RuntimeDirectory = $env:GP2_RUNTIME_DIR
        }
        elseif (Test-Path -LiteralPath (Join-Path $env:TEMP 'iu-gp2-audit-20261120')) {
            $RuntimeDirectory = Join-Path $env:TEMP 'iu-gp2-audit-20261120'
        }
        else {
            $RuntimeDirectory = Join-Path $env:TEMP 'iu-events-runtime'
        }
    }
    $clusterDirectory = Join-Path $RuntimeDirectory 'pgdata'
    if (!(Test-Path -LiteralPath (Join-Path $clusterDirectory 'PG_VERSION') -PathType Leaf)) {
        $clusterDirectory = $null
    }

    if (!$PostgresBin) {
        $psqlCmd = Get-Command psql.exe -ErrorAction SilentlyContinue
        if ($psqlCmd) {
            $PostgresBin = Split-Path -Parent $psqlCmd.Source
        }
        else {
            $pgBins = @(Get-ChildItem -Path (Join-Path $env:ProgramFiles "PostgreSQL") -Filter "bin" -Recurse -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
            if ($pgBins.Count -gt 0) { $PostgresBin = $pgBins[-1] }
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

    Start-Postgres $clusterDirectory $PostgresBin $databasePort
    Start-Mailpit $mailpit $smtpPort

    $backendProcess = $null
    if (!$backendRunning) {
        Write-Step "Starting backend server on $backendUrl..."
        $backendProcess = Start-Server $php ('-S 127.0.0.1:{0} "{1}"' -f $BackendPort, $router) (Join-Path $backend 'public') 'backend'
        $started += $backendProcess
    }
    Wait-ForHttp "$backendUrl/public/events" $backendProcess
    Write-Success "Backend is active at $backendUrl"

    $frontendProcess = $null
    if (!$frontendRunning) {
        Write-Step "Starting frontend server on $frontendUrl..."
        $env:NODE_ENV = 'development'
        $env:NODE_HOST = '127.0.0.1'
        $frontendProcess = Start-Server $node ('--import ./instrument.mjs "{0}" --port {1}' -f $entryPoint, $FrontendPort) $frontend 'frontend'
        $started += $frontendProcess
    }
    Wait-ForHttp $frontendUrl $frontendProcess
    Write-Success "Frontend is active at $frontendUrl"

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [IU Events Management Platform] Started Successfully!    " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " Frontend URL : $frontendUrl" -ForegroundColor Cyan
    Write-Host " Backend API  : $backendUrl" -ForegroundColor Cyan
    Write-Host " Mailpit UI   : $mailpitUrl" -ForegroundColor Cyan
    Write-Host " Logs Dir     : $logDir" -ForegroundColor DarkGray
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host ""

    if (!$NoBrowser) {
        Start-Process $frontendUrl
    }
}
catch {
    foreach ($server in $started) {
        if (!$server.HasExited) { Stop-Process -InputObject $server -ErrorAction SilentlyContinue }
    }
    Write-ErrorMsg $_.Exception.Message
    exit 1
}
finally {
    if ($lease) { $lease.Dispose() }
}
