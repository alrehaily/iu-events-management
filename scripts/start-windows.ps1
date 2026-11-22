param(
    [ValidateRange(1024, 65535)][int]$BackendPort = 8010,
    [ValidateRange(1024, 65535)][int]$FrontendPort = 5680,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$backendUrl = "http://127.0.0.1:$BackendPort"
$frontendUrl = "http://127.0.0.1:$FrontendPort"
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

function Test-Listener($Port, $EntryPoint) {
    $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    foreach ($listener in $listeners) {
        $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
        if ($listener.LocalAddress -ne '127.0.0.1' -or
            !$owner.CommandLine -or
            $owner.CommandLine.IndexOf($EntryPoint, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
            throw "Port $Port is already in use by another service."
        }
    }
    return ($listeners.Count -gt 0)
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
    if ($BackendPort -eq $FrontendPort) { throw 'The backend and frontend require different ports.' }
    $backendEnv = Join-Path $backend '.env'
    $frontendEnv = Join-Path $frontend '.env'
    if (!(Test-Path -LiteralPath $backendEnv)) {
        throw 'Configure backend/.env from backend/.env.example and provision its local database before starting.'
    }
    Assert-Setting $backendEnv 'APP_URL' $backendUrl
    Assert-Setting $backendEnv 'APP_FRONTEND_URL' $frontendUrl
    foreach ($setting in @('APP_KEY', 'JWT_SECRET')) {
        if (!(Read-Setting $backendEnv $setting)) { throw "Configure $setting in backend/.env before starting." }
    }

    $logDir = Join-Path $backend 'storage/logs'
    $lease = [IO.File]::Open((Join-Path $logDir 'windows-startup.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
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

    $php = (Get-Command php.exe).Source
    $node = (Get-Command node.exe).Source
    $router = Join-Path $backend 'vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php'
    $entryPoint = Join-Path $frontend 'server.js'
    if (!(Test-Path -LiteralPath $router)) { throw 'Run composer install in backend before starting.' }
    if (!(Test-Path -LiteralPath (Join-Path $frontend 'node_modules/vite/package.json'))) {
        throw 'Install frontend dependencies before starting.'
    }
    $backendRunning = Test-Listener $BackendPort $router
    $frontendRunning = Test-Listener $FrontendPort $entryPoint

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
