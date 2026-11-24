param(
    [ValidateRange(1024, 65535)][int]$BackendPort = 8010,
    [ValidateRange(1024, 65535)][int]$FrontendPort = 5680,
    [ValidateRange(1024, 65535)][int]$MailpitPort = 8225
)

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   IU Events Management Platform - Stopping Services      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ports = @($BackendPort, $FrontendPort, $MailpitPort)
$stoppedPids = @()

foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        $procId = $conn.OwningProcess
        if ($procId -and ($stoppedPids -notcontains $procId)) {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Stopping $($proc.ProcessName) (PID $procId on port $port)..." -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                $stoppedPids += $procId
            }
        }
    }
}

Write-Host "All local IU Events services stopped." -ForegroundColor Green
