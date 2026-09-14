@echo off
setlocal enabledelayedexpansion
title IU Events Platform -- Startup

:: ============================================================
::  IU Events Management Platform -- Start All
::  Islamic University of Madinah
::  --------------------------------------------------------
::  Run this file from the project root after git clone.
::  SAFE and IDEMPOTENT:
::    - Automatically creates frontend/.env if missing
::    - Automatically creates backend/.env if missing
::    - Automatically enables required PHP extensions on Windows
::    - Automatically creates PostgreSQL database if missing
::    - Creates public storage symlink for uploaded files
::    - Launches both servers and opens the browser
:: ============================================================

echo.
echo  =====================================================
echo   IU Events Management Platform -- Starting Up
echo   Islamic University of Madinah
echo  =====================================================
echo.

:: Resolve script directory -- robust with spaces in path
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"

call :DETECT_PG_PATH

:: Global tool state (detected once, used throughout)
set "COMPOSER_CMD=composer"
set "HAS_WINGET=0"
set "HAS_PGREADY=0"
set "PG_SVC_NAME="
set "PG_READY=0"

where winget    >nul 2>&1 && set "HAS_WINGET=1"
where pg_isready>nul 2>&1 && set "HAS_PGREADY=1"

:: ============================================================
:: Main control flow
:: Each subroutine returns: 0=ok  1=fatal  2=restart-required
:: ============================================================
call :STEP_DEPS
if !errorlevel! EQU 2 goto :RESTART_MSG
if !errorlevel! EQU 1 goto :ABORT

call :STEP_ENV
if !errorlevel! EQU 2 goto :RESTART_MSG
if errorlevel 1 goto :ABORT

call :STEP_NPM
if errorlevel 1 goto :ABORT

call :STEP_COMPOSER
if errorlevel 1 goto :ABORT

call :STEP_DB
if errorlevel 1 goto :ABORT

call :STEP_MIGRATE
if errorlevel 1 goto :ABORT

call :STEP_LAUNCH
goto :EOF

:RESTART_MSG
echo.
echo   A dependency was just installed.
echo   Please re-run this script to continue setup.
echo.
pause
exit /b 0

:ABORT
echo.
echo  ====================================================
echo   [ABORTED] Fix the errors listed above, then re-run.
echo  ====================================================
echo.
pause
exit /b 1

:: ============================================================
:: SUBROUTINE :OFFER_WINGET  id  "Friendly Name"  url
:: Output: _WINGET_OK=1 if installed (caller should return 2)
:: ============================================================
:OFFER_WINGET
set "_WINGET_OK=0"
if "!HAS_WINGET!"=="0" (
    echo          winget is not available on this machine.
    echo          Install %~2 manually: %~3
    exit /b 0
)
choice /c YN /m "  Install %~2 via winget now?"
if errorlevel 2 (
    echo          Install %~2 manually: %~3
    exit /b 0
)
echo   Installing %~2 via winget...
winget install --id %~1 -e --silent
if errorlevel 1 (
    echo   [ERROR] winget install failed.
    echo          Install %~2 manually: %~3
    exit /b 0
)
echo   [OK] %~2 installed.
set "_WINGET_OK=1"
exit /b 0

:: ============================================================
:: STEP 1 -- System dependency checks
:: ============================================================
:STEP_DEPS
echo [Step 1/7] Checking system dependencies...
echo.
set "_ERR=0"
set "_NEED_RESTART=0"

:: ----- 1a. Node.js (must exist AND be >= 18) -----
set "_HAVE_NODE=0"
where node >nul 2>&1
if not errorlevel 1 set "_HAVE_NODE=1"

if "!_HAVE_NODE!"=="0" (
    echo   [MISSING] Node.js ^>=18 is not installed.
    call :OFFER_WINGET "OpenJS.NodeJS.LTS" "Node.js LTS" "https://nodejs.org"
    if "!_WINGET_OK!"=="1" ( set "_NEED_RESTART=1" ) else ( set "_ERR=1" )
)
if "!_HAVE_NODE!"=="1" (
    for /f "tokens=1" %%v in ('node --version 2^>nul') do set "_NODE_VER=%%v"
    set "_NODE_MAJ=!_NODE_VER:~1!"
    for /f "tokens=1 delims=." %%m in ("!_NODE_MAJ!") do set "_NODE_MAJ=%%m"
    if !_NODE_MAJ! LSS 18 (
        echo   [ERROR] Node.js !_NODE_VER! is too old. Node.js ^>=18 is required.
        echo          Download latest LTS from: https://nodejs.org
        set "_ERR=1"
        set "_HAVE_NODE=0"
    )
)
if "!_HAVE_NODE!"=="1" echo   [OK] Node.js  !_NODE_VER!

:: ----- 1b. npm -----
set "_HAVE_NPM=0"
where npm >nul 2>&1
if not errorlevel 1 set "_HAVE_NPM=1"
if "!_HAVE_NPM!"=="0" (
    echo   [MISSING] npm not found. Reinstall Node.js: https://nodejs.org
    set "_ERR=1"
)
if "!_HAVE_NPM!"=="1" (
    for /f "tokens=*" %%v in ('npm --version 2^>nul') do set "_NPM_VER=%%v"
    echo   [OK] npm      v!_NPM_VER!
)

:: ----- 1c. PHP (must exist AND be >= 8.3) -----
set "_HAVE_PHP=0"
where php >nul 2>&1
if not errorlevel 1 set "_HAVE_PHP=1"

if "!_HAVE_PHP!"=="0" (
    echo.
    echo   [MISSING] PHP ^>=8.3 is not installed.
    call :OFFER_WINGET "PHP.PHP.8.4" "PHP 8.4" "https://windows.php.net/download/"
    if "!_WINGET_OK!"=="1" ( set "_NEED_RESTART=1" ) else ( set "_ERR=1" )
)
if "!_HAVE_PHP!"=="1" (
    php -r "exit(PHP_VERSION_ID >= 80300 ? 0 : 1);"
    if errorlevel 1 (
        echo   [ERROR] PHP is too old. PHP ^>=8.3 is required.
        echo          Install PHP 8.4: winget install --id PHP.PHP.8.4 -e
        set "_ERR=1"
        set "_HAVE_PHP=0"
    )
)
if "!_HAVE_PHP!"=="1" (
    for /f "tokens=2" %%v in ('php -v 2^>nul ^| findstr /i "^PHP"') do set "_PHP_VER=%%v"
    echo   [OK] PHP !_PHP_VER!

    rem Automatically verify and enable required extensions in php.ini
    if exist "%BACKEND%\scripts\enable-php-extensions.php" (
        php "%BACKEND%\scripts\enable-php-extensions.php"
    )

    rem Verify required modules
    set "_EXT_MISS=0"
    for %%e in (intl pdo_pgsql openssl mbstring fileinfo curl gd sodium) do (
        php -m 2>nul ^| findstr /i "^%%e$" >nul 2>&1
        if errorlevel 1 (
            echo   [MISSING] PHP extension: %%e
            set "_EXT_MISS=1"
        )
    )
    if "!_EXT_MISS!"=="1" (
        echo.
        echo   [ERROR] Some required PHP extensions could not be enabled automatically.
        echo   Please edit php.ini and enable them:
        echo     extension=intl
        echo     extension=pdo_pgsql
        echo     extension=openssl
        echo     extension=mbstring
        echo     extension=fileinfo
        echo     extension=curl
        echo     extension=gd
        echo     extension=sodium
        set "_ERR=1"
    ) else (
        echo   [OK] PHP extensions verified.
    )
)

:: ----- 1d. Composer -----
set "_HAVE_COMP=0"
where composer >nul 2>&1
if not errorlevel 1 (
    set "_HAVE_COMP=1"
    for /f "tokens=1,2,3" %%a in ('composer --version 2^>nul') do set "_COMP_VER=%%a %%b %%c"
    echo   [OK] !_COMP_VER!
)
if "!_HAVE_COMP!"=="0" (
    if exist "%BACKEND%\composer.phar" (
        set "COMPOSER_CMD=php "%BACKEND%\composer.phar""
        set "_HAVE_COMP=1"
        echo   [OK] Composer (local composer.phar in backend/)
    )
)
if "!_HAVE_COMP!"=="0" (
    echo.
    echo   [MISSING] Composer is not installed.
    call :OFFER_WINGET "Composer.Composer" "Composer" "https://getcomposer.org/download/"
    if "!_WINGET_OK!"=="1" ( set "_NEED_RESTART=1" ) else ( set "_ERR=1" )
)

:: ----- 1e. PostgreSQL: detect service and status -----
echo.
echo   Checking PostgreSQL...
call :DETECT_PG_SERVICE

if "!PG_READY!"=="0" (
    if "!PG_SVC_NAME!"=="" (
        echo   [MISSING] PostgreSQL is not installed.
        call :OFFER_WINGET "PostgreSQL.PostgreSQL.16" "PostgreSQL 16" "https://www.postgresql.org/download/windows/"
        if "!_WINGET_OK!"=="1" (
            echo.
            echo   IMPORTANT: Remember the password you choose for 'postgres' superuser.
            echo   This script will ask for it on the next run.
            set "_NEED_RESTART=1"
        ) else (
            set "_ERR=1"
        )
    ) else (
        echo   [ERROR] Cannot start PostgreSQL service "!PG_SVC_NAME!".
        echo          Start the service manually in services.msc or run:
        echo            net start "!PG_SVC_NAME!"
        set "_ERR=1"
    )
)
echo.

if "!_NEED_RESTART!"=="1" exit /b 2
if "!_ERR!"=="1"          exit /b 1
exit /b 0

:: ============================================================
:: SUBROUTINE :DETECT_PG_PATH
:: ============================================================
:DETECT_PG_PATH
where pg_isready >nul 2>&1 && exit /b 0
if exist "%ProgramFiles%\PostgreSQL" (
    for /d %%d in ("%ProgramFiles%\PostgreSQL\*") do (
        if exist "%%d\bin\pg_isready.exe" (
            set "PATH=%%d\bin;%PATH%"
            exit /b 0
        )
    )
)
if exist "%SystemDrive%\Program Files (x86)\PostgreSQL" (
    for /d %%d in ("%SystemDrive%\Program Files (x86)\PostgreSQL\*") do (
        if exist "%%d\bin\pg_isready.exe" (
            set "PATH=%%d\bin;%PATH%"
            exit /b 0
        )
    )
)
exit /b 0

:: ============================================================
:: SUBROUTINE :DETECT_PG_SERVICE
:: ============================================================
:DETECT_PG_SERVICE
set "PG_READY=0"

where pg_isready >nul 2>&1
if not errorlevel 1 (
    pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
    if not errorlevel 1 (
        set "PG_READY=1"
        echo   [OK] PostgreSQL is running.
        exit /b 0
    )
)

echo   PostgreSQL is not responding. Attempting to start service...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Service *postgres* -ErrorAction SilentlyContinue | Where-Object Status -ne 'Running' | Start-Service" >nul 2>&1

where pg_isready >nul 2>&1
if not errorlevel 1 (
    pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
    if not errorlevel 1 (
        set "PG_READY=1"
        echo   [OK] PostgreSQL service started successfully.
        exit /b 0
    )
)

if exist "%BACKEND%\scripts\ensure-database.php" (
    php "%BACKEND%\scripts\ensure-database.php" >nul 2>&1
    if not errorlevel 1 (
        set "PG_READY=1"
        echo   [OK] PostgreSQL is reachable.
        exit /b 0
    )
)

exit /b 0

:: ============================================================
:: STEP 2 -- Environment configuration (Frontend & Backend)
:: ============================================================
:STEP_ENV
echo [Step 2/7] Environment configuration...

:: ----- Frontend .env setup -----
if not exist "%FRONTEND%\.env" (
    echo   frontend/.env not found -- creating default configuration...
    (
        echo VITE_API_URL_CLIENT=http://127.0.0.1:8000
        echo VITE_API_URL_SERVER=http://127.0.0.1:8000
        echo VITE_FRONTEND_URL=http://localhost:5678
    ) > "%FRONTEND%\.env"
    echo   [OK] frontend/.env created.
) else (
    echo   [OK] frontend/.env exists.
)

:: ----- Backend .env setup -----
if exist "%BACKEND%\.env" (
    echo   [OK] backend/.env exists -- not overwriting.
    goto :env_generate_keys
)

echo   backend/.env not found -- creating from .env.example...
copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul

set "_ENV_FILE=%BACKEND%\.env"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$f = $env:_ENV_FILE; (Get-Content $f) | ForEach-Object { if ($_ -match '^APP_KEY=') { 'APP_KEY=' } elseif ($_ -match '^JWT_SECRET=') { 'JWT_SECRET=' } elseif ($_ -match '^APP_URL=') { 'APP_URL=http://127.0.0.1:8000' } elseif ($_ -match '^APP_FRONTEND_URL=') { 'APP_FRONTEND_URL=http://localhost:5678' } elseif ($_ -match '^DB_HOST=') { 'DB_HOST=127.0.0.1' } elseif ($_ -match '^DB_USERNAME=') { 'DB_USERNAME=postgres' } elseif ($_ -match '^DB_PASSWORD=') { 'DB_PASSWORD=' } elseif ($_ -match '^FILESYSTEM_PUBLIC_DISK=') { 'FILESYSTEM_PUBLIC_DISK=public' } elseif ($_ -match '^FILESYSTEM_PRIVATE_DISK=') { 'FILESYSTEM_PRIVATE_DISK=local' } else { $_ } } | Set-Content $f"

echo   [OK] backend/.env created with local environment defaults.
echo.

echo   ============================================================
echo    DATABASE PASSWORD SETUP (one-time only)
echo   ============================================================
echo    This project connects to PostgreSQL user 'postgres'.
echo    Enter the password for 'postgres' (or press Enter if blank):
echo.

set "_ENV_FILE=%BACKEND%\.env"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$p = Read-Host -Prompt '  PostgreSQL password for postgres'; $f = $env:_ENV_FILE; $lines = Get-Content $f; $out = $lines | ForEach-Object { if ($_ -match '^DB_PASSWORD=') { 'DB_PASSWORD=' + $p } else { $_ } }; $out | Set-Content $f; Write-Host '  [OK] Password saved to backend/.env.'"
echo.

:env_generate_keys
:: Generate fresh APP_KEY if missing
set "_KEY_MISSING=1"
for /f "tokens=1,* delims==" %%a in ('findstr /i "^APP_KEY=" "%BACKEND%\.env"') do (
    if not "%%b"=="" set "_KEY_MISSING=0"
)
if "!_KEY_MISSING!"=="1" (
    echo   APP_KEY is blank -- generating fresh key...
    pushd "%BACKEND%"
    php artisan key:generate --no-interaction --force
    set "_KEY_RC=!errorlevel!"
    popd
    if "!_KEY_RC!" NEQ "0" (
        echo   [ERROR] key:generate failed.
        exit /b 1
    )
    echo   [OK] Fresh APP_KEY generated.
) else (
    echo   [OK] APP_KEY already set.
)

:: Generate fresh JWT_SECRET if missing
set "_JWT_MISSING=1"
for /f "tokens=1,* delims==" %%a in ('findstr /i "^JWT_SECRET=" "%BACKEND%\.env"') do (
    if not "%%b"=="" set "_JWT_MISSING=0"
)
if "!_JWT_MISSING!"=="1" (
    echo   JWT_SECRET is blank -- generating fresh secret...
    pushd "%BACKEND%"
    php artisan jwt:secret --no-interaction --force
    set "_JWT_RC=!errorlevel!"
    popd
    if "!_JWT_RC!" NEQ "0" (
        echo   [ERROR] jwt:secret failed.
        exit /b 1
    )
    echo   [OK] Fresh JWT_SECRET generated.
) else (
    echo   [OK] JWT_SECRET already set.
)
echo.
exit /b 0

:: ============================================================
:: STEP 3 -- Frontend: sync npm packages
:: ============================================================
:STEP_NPM
echo [Step 3/7] Frontend -- syncing npm packages...
set "_NPM_LOCK=%FRONTEND%\package-lock.json"
set "_NPM_STAMP=%FRONTEND%\node_modules\.lock_hash"
set "_RUN_NPM=1"

if exist "%FRONTEND%\node_modules" (
    if exist "!_NPM_LOCK!" (
        set "_NPM_LOCK_PATH=!_NPM_LOCK!"
        for /f "delims=" %%h in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-FileHash $env:_NPM_LOCK_PATH -Algorithm SHA256).Hash"') do set "_CUR_NPM_HASH=%%h"
        set "_OLD_NPM_HASH=NONE"
        if exist "!_NPM_STAMP!" for /f "usebackq delims=" %%h in ("!_NPM_STAMP!") do set "_OLD_NPM_HASH=%%h"
        if "!_CUR_NPM_HASH!"=="!_OLD_NPM_HASH!" set "_RUN_NPM=0"
    )
)

if "!_RUN_NPM!"=="0" (
    echo   [OK] node_modules matches package-lock.json -- skipping install.
    echo.
    exit /b 0
)

pushd "%FRONTEND%"
if exist "!_NPM_LOCK!" (
    echo   Running npm ci --legacy-peer-deps...
    call npm ci --legacy-peer-deps
) else (
    echo   Running npm install --legacy-peer-deps...
    call npm install --legacy-peer-deps
)
set "_NPM_RC=!errorlevel!"
popd

if "!_NPM_RC!" NEQ "0" (
    echo   [ERROR] npm failed with exit code !_NPM_RC!.
    exit /b 1
)

if exist "!_NPM_LOCK!" (
    set "_NPM_LOCK_PATH=!_NPM_LOCK!"
    for /f "delims=" %%h in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-FileHash $env:_NPM_LOCK_PATH -Algorithm SHA256).Hash"') do echo %%h>"!_NPM_STAMP!"
)
echo   [OK] npm packages ready.
echo.
exit /b 0

:: ============================================================
:: STEP 4 -- Backend: sync Composer packages
:: ============================================================
:STEP_COMPOSER
echo [Step 4/7] Backend -- syncing Composer packages...
set "_COMP_LOCK=%BACKEND%\composer.lock"
set "_COMP_STAMP=%BACKEND%\vendor\.lock_hash"
set "_RUN_COMP=1"

if exist "%BACKEND%\vendor" (
    if exist "!_COMP_LOCK!" (
        set "_COMP_LOCK_PATH=!_COMP_LOCK!"
        for /f "delims=" %%h in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-FileHash $env:_COMP_LOCK_PATH -Algorithm SHA256).Hash"') do set "_CUR_COMP_HASH=%%h"
        set "_OLD_COMP_HASH=NONE"
        if exist "!_COMP_STAMP!" for /f "usebackq delims=" %%h in ("!_COMP_STAMP!") do set "_OLD_COMP_HASH=%%h"
        if "!_CUR_COMP_HASH!"=="!_OLD_COMP_HASH!" set "_RUN_COMP=0"
    )
)

if "!_RUN_COMP!"=="0" (
    echo   [OK] vendor/ matches composer.lock -- skipping install.
    echo.
    exit /b 0
)

pushd "%BACKEND%"
echo   Running composer install...
call %COMPOSER_CMD% install --no-interaction --prefer-dist --optimize-autoloader
if errorlevel 1 (
    echo   Retrying composer install with --ignore-platform-reqs...
    call %COMPOSER_CMD% install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs
)
set "_COMP_RC=!errorlevel!"
popd

if "!_COMP_RC!" NEQ "0" (
    echo   [ERROR] composer install failed.
    exit /b 1
)

if exist "!_COMP_LOCK!" (
    set "_COMP_LOCK_PATH=!_COMP_LOCK!"
    for /f "delims=" %%h in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-FileHash $env:_COMP_LOCK_PATH -Algorithm SHA256).Hash"') do echo %%h>"!_COMP_STAMP!"
)
echo   [OK] Composer packages ready.
echo.
exit /b 0

:: ============================================================
:: STEP 5 -- Database: verify and create if missing
:: ============================================================
:STEP_DB
echo [Step 5/7] Verifying database connection...

if exist "%BACKEND%\scripts\ensure-database.php" (
    php "%BACKEND%\scripts\ensure-database.php"
    if errorlevel 1 (
        echo.
        echo   [ERROR] Failed to connect or create database.
        echo   Please verify:
        echo     1. PostgreSQL service is running.
        echo     2. DB_PASSWORD in backend/.env is correct.
        exit /b 1
    )
) else (
    pushd "%BACKEND%"
    php artisan db:show >nul 2>&1
    set "_DB_RC=!errorlevel!"
    popd
    if "!_DB_RC!" NEQ "0" (
        echo   [ERROR] Cannot connect to database.
        exit /b 1
    )
)

echo.
exit /b 0

:: ============================================================
:: STEP 6 -- Migrations and storage symlink
:: ============================================================
:STEP_MIGRATE
echo [Step 6/7] Running database migrations and setting up storage...

pushd "%BACKEND%"
php artisan migrate --no-interaction --force
set "_MIG_RC=!errorlevel!"

if "!_MIG_RC!" NEQ "0" (
    echo.
    echo   [ERROR] Migration failed.
    popd
    exit /b 1
)

echo   Creating storage symlink...
php artisan storage:link --no-interaction >nul 2>&1
popd

echo   [OK] Migrations and storage ready.
echo.
exit /b 0

:: ============================================================
:: STEP 7 -- Launch servers and open browser
:: ============================================================
:STEP_LAUNCH
echo [Step 7/7] Launching servers...

echo   Starting Laravel backend  (http://127.0.0.1:8000)...
start "IU Events -- Laravel Backend" /D "%BACKEND%" cmd /k "title IU Events -- Laravel Backend && php artisan serve --host=127.0.0.1 --port=8000"

ping 127.0.0.1 -n 3 >nul

echo   Starting React frontend   (http://localhost:5678)...
start "IU Events -- React Frontend" /D "%FRONTEND%" cmd /k "title IU Events -- React Frontend && call npm run dev:csr"

ping 127.0.0.1 -n 4 >nul

echo   Opening browser at http://localhost:5678 ...
start http://localhost:5678

echo.
echo  ====================================================
echo.
echo   IU Events Platform is UP and RUNNING!
echo.
echo   Frontend  :  http://localhost:5678
echo   Backend   :  http://127.0.0.1:8000
echo.
echo   Two terminal windows are running:
echo     - "IU Events -- Laravel Backend"  (port 8000)
echo     - "IU Events -- React Frontend"   (port 5678)
echo.
echo   Keep both windows open while using the application.
echo   Close those windows to stop the servers.
echo.
echo  ====================================================
echo.
pause
exit /b 0
