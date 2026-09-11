@echo off
setlocal enabledelayedexpansion
title IU Events Platform -- Startup

:: ============================================================
::  IU Events Management Platform -- Start All
::  Islamic University of Madinah
::  --------------------------------------------------------
::  Run this file from the project root after git clone.
::  SAFE and IDEMPOTENT:
::    - Never overwrites an existing backend/.env
::    - Never drops or resets the database
::    - Generates fresh APP_KEY and JWT_SECRET on first run only
::    - Syncs npm/composer only when lock file SHA256 changes
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

:: Global tool state (detected once, used throughout)
set "COMPOSER_CMD=composer"
set "HAS_WINGET=0"
set "HAS_PSQL=0"
set "HAS_PGREADY=0"
set "PG_SVC_NAME="
set "PG_READY=0"

where winget    >nul 2>&1 && set "HAS_WINGET=1"
where psql      >nul 2>&1 && set "HAS_PSQL=1"
where pg_isready>nul 2>&1 && set "HAS_PGREADY=1"

:: ============================================================
:: Main control flow
:: Each subroutine returns: 0=ok  1=fatal  2=restart-required
:: ============================================================
call :STEP_DEPS
if !errorlevel! EQU 2 goto :RESTART_MSG
if !errorlevel! EQU 1 goto :ABORT

call :STEP_NPM
if errorlevel 1 goto :ABORT

call :STEP_COMPOSER
if errorlevel 1 goto :ABORT

call :STEP_ENV
if !errorlevel! EQU 2 goto :RESTART_MSG
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
:: Fully goto-free: uses flag variables, no goto inside blocks.
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
    :: Strip leading 'v' then extract major version number
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

:: ----- 1c. PHP (must exist AND be >= 8.3 AND have required extensions) -----
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
    :: Parse version: "PHP 8.4.1 (cli) ..."  -> tokens=2 gives "8.4.1"
    for /f "tokens=2" %%v in ('php --version 2^>nul ^| findstr /i "^PHP"') do set "_PHP_VER=%%v"
    for /f "tokens=1,2 delims=." %%a in ("!_PHP_VER!") do (
        set "_PHP_MAJ=%%a"
        set "_PHP_MIN=%%b"
    )
    set "_PHP_VER_OK=1"
    if !_PHP_MAJ! LSS 8 set "_PHP_VER_OK=0"
    if !_PHP_MAJ! EQU 8 if !_PHP_MIN! LSS 3 set "_PHP_VER_OK=0"
    if "!_PHP_VER_OK!"=="0" (
        echo   [ERROR] PHP !_PHP_VER! is too old. PHP ^>=8.3 required.
        echo          Install PHP 8.4: winget install --id PHP.PHP.8.4 -e
        set "_ERR=1"
        set "_HAVE_PHP=0"
    )
)
if "!_HAVE_PHP!"=="1" (
    echo   [OK] PHP !_PHP_VER!
    :: Extension check -- each tested individually so all missing ones are listed
    set "_EXT_MISS=0"
    for %%e in (intl xmlwriter pdo_pgsql pgsql openssl mbstring) do (
        php -m 2>nul | findstr /i "^%%e$" >nul 2>&1
        if errorlevel 1 (
            echo   [MISSING] PHP extension: %%e
            set "_EXT_MISS=1"
        )
    )
    if "!_EXT_MISS!"=="1" (
        echo.
        echo   Edit php.ini to enable missing extensions (find path: php --ini^):
        echo     extension=intl
        echo     extension=pdo_pgsql
        echo     extension=pgsql
        echo     extension=openssl
        echo     extension=mbstring
        echo     extension=xmlwriter
        set "_ERR=1"
    ) else (
        echo   [OK] PHP extensions: intl, xmlwriter, pdo_pgsql, pgsql, openssl, mbstring
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
        echo   [OK] Composer  (local composer.phar in backend/)
    )
)
if "!_HAVE_COMP!"=="0" (
    echo.
    echo   [MISSING] Composer is not installed.
    call :OFFER_WINGET "Composer.Composer" "Composer" "https://getcomposer.org/download/"
    if "!_WINGET_OK!"=="1" ( set "_NEED_RESTART=1" ) else ( set "_ERR=1" )
)

:: ----- 1e. PostgreSQL: detect via pg_isready, then sc query -----
echo.
echo   Checking PostgreSQL...
call :DETECT_PG_SERVICE

if "!PG_READY!"=="0" (
    if "!PG_SVC_NAME!"=="" (
        :: Not installed at all
        echo   [MISSING] PostgreSQL is not installed.
        call :OFFER_WINGET "PostgreSQL.PostgreSQL.16" "PostgreSQL 16" "https://www.postgresql.org/download/windows/"
        if "!_WINGET_OK!"=="1" (
            echo.
            echo   IMPORTANT: The PostgreSQL installer will ask you to set a password
            echo   for the 'postgres' superuser. Remember it -- this script will ask
            echo   for it on the next run.
            set "_NEED_RESTART=1"
        ) else (
            set "_ERR=1"
        )
    ) else (
        :: Service detected but could not be started
        echo   [ERROR] Cannot start PostgreSQL service "!PG_SVC_NAME!".
        echo          Run this script as Administrator, or start the service manually:
        echo            net start "!PG_SVC_NAME!"
        echo          Or open services.msc, start the service, then re-run.
        set "_ERR=1"
    )
)
echo.

if "!_NEED_RESTART!"=="1" exit /b 2
if "!_ERR!"=="1"          exit /b 1
exit /b 0

:: ============================================================
:: SUBROUTINE :DETECT_PG_SERVICE
:: Detects the exact PostgreSQL service name dynamically.
:: Supports any installed version without hard-coding.
:: Sets: PG_SVC_NAME, PG_READY
:: ============================================================
:DETECT_PG_SERVICE
set "PG_READY=0"

:: --- 1. pg_isready: fastest and most reliable check ---
if "!HAS_PGREADY!"=="1" (
    pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
    if not errorlevel 1 (
        set "PG_READY=1"
        echo   [OK] PostgreSQL is running (pg_isready confirmed).
        exit /b 0
    )
)

:: --- 2. Find the real PostgreSQL service name via sc query ---
:: Parse "SERVICE_NAME: postgresql-x64-16" lines only.
:: Double-filter: first keep SERVICE_NAME lines, then keep postgresql ones.
:: This is safe -- it cannot match STATE/RUNNING from unrelated services.
if "!PG_SVC_NAME!"=="" (
    for /f "tokens=2 delims=:" %%s in ('sc query state= all 2^>nul ^| findstr /i "SERVICE_NAME" ^| findstr /i "postgresql"') do (
        if "!PG_SVC_NAME!"=="" (
            :: Trim leading space from token
            for /f "tokens=*" %%t in ("%%s") do set "PG_SVC_NAME=%%t"
        )
    )
)

if "!PG_SVC_NAME!"=="" exit /b 0

:: --- 3. Is the found service already running? ---
sc query "!PG_SVC_NAME!" 2>nul | findstr /i "RUNNING" >nul 2>&1
if not errorlevel 1 (
    set "PG_READY=1"
    echo   [OK] PostgreSQL service "!PG_SVC_NAME!" is running.
    exit /b 0
)

:: --- 4. Service stopped -- try to start the exact detected service ---
echo   PostgreSQL service "!PG_SVC_NAME!" is stopped. Attempting to start...
net start "!PG_SVC_NAME!" >nul 2>&1
if errorlevel 1 (
    echo   [WARNING] Could not start service (may need Administrator privileges).
    exit /b 0
)
:: Re-verify
sc query "!PG_SVC_NAME!" 2>nul | findstr /i "RUNNING" >nul 2>&1
if not errorlevel 1 (
    set "PG_READY=1"
    echo   [OK] PostgreSQL service "!PG_SVC_NAME!" started.
) else (
    echo   [WARNING] Service start issued but status unconfirmed.
)
exit /b 0

:: ============================================================
:: STEP 2 -- Frontend: sync npm packages via SHA256 lock hash
:: ============================================================
:STEP_NPM
echo [Step 2/7] Frontend -- syncing npm packages...
set "_NPM_LOCK=%FRONTEND%\package-lock.json"
set "_NPM_STAMP=%FRONTEND%\node_modules\.lock_hash"
set "_RUN_NPM=1"

:: Only skip if node_modules exists AND lock hash is unchanged
if exist "%FRONTEND%\node_modules" (
    if exist "!_NPM_LOCK!" (
        :: Use env var for path so PowerShell handles spaces correctly
        set "_NPM_LOCK_PATH=!_NPM_LOCK!"
        for /f "delims=" %%h in ('powershell -NoProfile -Command "(Get-FileHash $env:_NPM_LOCK_PATH -Algorithm SHA256).Hash"') do set "_CUR_NPM_HASH=%%h"
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
    echo   Running npm ci (reproducible, lock-file-matched install^)...
    npm ci
) else (
    echo   Running npm install (no package-lock.json found^)...
    npm install
)
set "_NPM_RC=!errorlevel!"
popd

if "!_NPM_RC!" NEQ "0" (
    echo   [ERROR] npm failed with exit code !_NPM_RC!. See output above.
    exit /b 1
)

:: Write current lock hash as stamp for next run
if exist "!_NPM_LOCK!" (
    set "_NPM_LOCK_PATH=!_NPM_LOCK!"
    for /f "delims=" %%h in ('powershell -NoProfile -Command "(Get-FileHash $env:_NPM_LOCK_PATH -Algorithm SHA256).Hash"') do echo %%h>"!_NPM_STAMP!"
)
echo   [OK] npm packages installed and hash stamped.
echo.
exit /b 0

:: ============================================================
:: STEP 3 -- Backend: sync Composer packages via SHA256 lock hash
:: ============================================================
:STEP_COMPOSER
echo [Step 3/7] Backend -- syncing Composer packages...
set "_COMP_LOCK=%BACKEND%\composer.lock"
set "_COMP_STAMP=%BACKEND%\vendor\.lock_hash"
set "_RUN_COMP=1"

if exist "%BACKEND%\vendor" (
    if exist "!_COMP_LOCK!" (
        set "_COMP_LOCK_PATH=!_COMP_LOCK!"
        for /f "delims=" %%h in ('powershell -NoProfile -Command "(Get-FileHash $env:_COMP_LOCK_PATH -Algorithm SHA256).Hash"') do set "_CUR_COMP_HASH=%%h"
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
%COMPOSER_CMD% install --no-interaction --prefer-dist --optimize-autoloader
set "_COMP_RC=!errorlevel!"
popd

if "!_COMP_RC!" NEQ "0" (
    echo   [ERROR] composer install failed. See output above.
    exit /b 1
)

if exist "!_COMP_LOCK!" (
    set "_COMP_LOCK_PATH=!_COMP_LOCK!"
    for /f "delims=" %%h in ('powershell -NoProfile -Command "(Get-FileHash $env:_COMP_LOCK_PATH -Algorithm SHA256).Hash"') do echo %%h>"!_COMP_STAMP!"
)
echo   [OK] Composer packages installed and hash stamped.
echo.
exit /b 0

:: ============================================================
:: STEP 4 -- Environment: backend/.env (NEVER overwrites)
:: ============================================================
:STEP_ENV
echo [Step 4/7] Environment configuration...

if exist "%BACKEND%\.env" (
    echo   [OK] backend/.env exists -- not overwriting.
    goto :env_generate_keys
)

:: ----- First run: create .env from example -----
echo   backend/.env not found -- creating from .env.example...
copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul

:: Clear example secrets and apply local defaults.
:: Use env var for path so PowerShell handles spaces correctly.
:: The regex replacement is a simple line-by-line foreach -- safe with all chars.
set "_ENV_FILE=%BACKEND%\.env"
powershell -NoProfile -Command ^
    "$f = $env:_ENV_FILE; (Get-Content $f) | ForEach-Object { if ($_ -match '^APP_KEY=') { 'APP_KEY=' } elseif ($_ -match '^JWT_SECRET=') { 'JWT_SECRET=' } elseif ($_ -match '^DB_HOST=pgsql') { 'DB_HOST=127.0.0.1' } elseif ($_ -match '^DB_USERNAME=username') { 'DB_USERNAME=postgres' } elseif ($_ -match '^DB_PASSWORD=password') { 'DB_PASSWORD=' } elseif ($_ -match '^APP_FRONTEND_URL=') { 'APP_FRONTEND_URL=http://localhost:5678' } else { $_ } } | Set-Content $f"

echo   [OK] .env created -- example secrets cleared, local defaults applied.
echo.

:: ----- Prompt for PostgreSQL password (one-time) -----
:: PowerShell Read-Host handles ALL special characters natively.
:: The password is passed entirely within PowerShell -- never stored in a CMD variable.
echo   ============================================================
echo    DATABASE PASSWORD SETUP (one-time only)
echo   ============================================================
echo    This project uses PostgreSQL as user 'postgres'.
echo    Enter the password you chose when installing PostgreSQL.
echo    (Press Enter for no password if PostgreSQL has no password set.)
echo.
echo    The password will be saved to backend/.env and never asked again.
echo   ============================================================
echo.

set "_ENV_FILE=%BACKEND%\.env"
powershell -NoProfile -Command ^
    "$p = Read-Host -Prompt '  PostgreSQL password for postgres'; $f = $env:_ENV_FILE; $lines = Get-Content $f; $out = $lines | ForEach-Object { if ($_ -match '^DB_PASSWORD=') { 'DB_PASSWORD=' + $p } else { $_ } }; $out | Set-Content $f; Write-Host '  [OK] PostgreSQL password saved to backend/.env.'"
echo.
echo   APP_KEY and JWT_SECRET will be generated now...
echo.

:: Fall through to key generation
goto :env_generate_keys

:env_generate_keys
:: === Generate fresh APP_KEY only if missing/blank ===
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

:: === Generate fresh JWT_SECRET only if missing/blank ===
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
:: STEP 5 -- Database: verify connection; create DB if missing
:: DB_PASSWORD is NEVER stored in a CMD variable.
:: All connection tests go through Laravel (PHP reads .env directly).
:: psql is used only for DB creation and lets it prompt interactively.
:: ============================================================
:STEP_DB
echo [Step 5/7] Verifying database connection...

:: Read only non-secret connection params
for /f "usebackq tokens=1,* delims==" %%a in ("%BACKEND%\.env") do (
    if /i "%%a"=="DB_HOST"     set "DB_HOST=%%b"
    if /i "%%a"=="DB_PORT"     set "DB_PORT=%%b"
    if /i "%%a"=="DB_DATABASE" set "DB_DATABASE=%%b"
    if /i "%%a"=="DB_USERNAME" set "DB_USERNAME=%%b"
)
for /f "tokens=1" %%v in ("!DB_HOST!")     do set "DB_HOST=%%v"
for /f "tokens=1" %%v in ("!DB_PORT!")     do set "DB_PORT=%%v"
for /f "tokens=1" %%v in ("!DB_DATABASE!") do set "DB_DATABASE=%%v"
for /f "tokens=1" %%v in ("!DB_USERNAME!") do set "DB_USERNAME=%%v"

echo   Host:     !DB_HOST!:!DB_PORT!
echo   Database: !DB_DATABASE!
echo   User:     !DB_USERNAME!
echo   Password: (stored privately in backend/.env)
echo.

:: Test via Laravel -- PHP reads .env natively, no shell variable / ! issues
pushd "%BACKEND%"
php artisan db:show >nul 2>&1
set "_DB_RC=!errorlevel!"
popd

if "!_DB_RC!"=="0" (
    echo   [OK] Database "!DB_DATABASE!" is reachable.
    echo.
    exit /b 0
)

echo   [WARNING] Cannot connect to "!DB_DATABASE!".
echo.

:: --- psql-based diagnostics: can the server be reached at all? ---
if "!HAS_PSQL!"=="0" (
    echo   [ERROR] Cannot connect to the database. psql not found for diagnostics.
    echo.
    echo   Check:
    echo     1. PostgreSQL service is running (services.msc)
    echo     2. backend/.env DB_PASSWORD matches your postgres installation
    echo     3. The database "!DB_DATABASE!" exists
    echo        Create it: createdb -U !DB_USERNAME! !DB_DATABASE!
    exit /b 1
)

:: psql will prompt interactively for the password if needed.
:: We do NOT set PGPASSWORD -- the user types their password.
echo   Testing server reachability (psql may ask for your password)...
psql -h !DB_HOST! -p !DB_PORT! -U !DB_USERNAME! -d postgres -c "" >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Cannot reach PostgreSQL at !DB_HOST!:!DB_PORT!.
    echo.
    echo   Check:
    echo     1. PostgreSQL service is running (services.msc)
    echo     2. DB_HOST, DB_PORT, DB_USERNAME in backend/.env are correct
    echo     3. DB_PASSWORD in backend/.env matches your postgres user password
    exit /b 1
)

:: Server is reachable -- database probably does not exist yet
echo   Server is reachable. Database "!DB_DATABASE!" may not exist.
echo.
choice /c YN /m "  Create database '!DB_DATABASE!' now?"
if errorlevel 2 (
    echo   [INFO] Create the database manually, then re-run this script:
    echo          createdb -U !DB_USERNAME! !DB_DATABASE!
    exit /b 1
)

echo   Creating database "!DB_DATABASE!"...
psql -h !DB_HOST! -p !DB_PORT! -U !DB_USERNAME! -d postgres -c "CREATE DATABASE \"!DB_DATABASE!\";" 2>&1
if errorlevel 1 (
    echo   [ERROR] Failed to create database "!DB_DATABASE!".
    echo          It may already exist, or the connection test above used cached credentials.
    echo          Check backend/.env DB_PASSWORD and try:
    echo            createdb -U !DB_USERNAME! !DB_DATABASE!
    exit /b 1
)
echo   [OK] Database "!DB_DATABASE!" created successfully.
echo.
exit /b 0

:: ============================================================
:: STEP 6 -- Migrations (safe: no drops, no resets, ever)
:: ============================================================
:STEP_MIGRATE
echo [Step 6/7] Running database migrations...

pushd "%BACKEND%"
php artisan migrate --no-interaction --force
set "_MIG_RC=!errorlevel!"
popd

if "!_MIG_RC!" NEQ "0" (
    echo.
    echo   [ERROR] Migration failed. No database reset or drop was performed.
    echo          Check migration status before retrying:
    echo            cd backend
    echo            php artisan migrate:status
    exit /b 1
)
echo   [OK] Migrations complete.
echo.
exit /b 0

:: ============================================================
:: STEP 7 -- Launch servers in separate terminal windows
:: Uses start /D for robust working-directory handling (spaces-safe).
:: ============================================================
:STEP_LAUNCH
echo [Step 7/7] Launching servers...

echo   Starting Laravel backend  (http://127.0.0.1:8000^)...
start "IU Events -- Laravel Backend" /D "%BACKEND%" cmd /k "title IU Events -- Laravel Backend && php artisan serve --host=127.0.0.1 --port=8000"

timeout /t 2 /nobreak >nul

echo   Starting React frontend   (http://localhost:5678^)...
start "IU Events -- React Frontend" /D "%FRONTEND%" cmd /k "title IU Events -- React Frontend && npm run dev:csr"

timeout /t 3 /nobreak >nul

echo.
echo  ====================================================
echo.
echo   IU Events Platform is starting up!
echo.
echo   Frontend  :  http://localhost:5678
echo   Backend   :  http://127.0.0.1:8000
echo.
echo   Two terminal windows have been opened:
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
