@echo off
setlocal EnableExtensions EnableDelayedExpansion
title IU Events Platform -- Startup

:: ============================================================
::  IU Events Management Platform -- Start All
::  Islamic University of Madinah
::  --------------------------------------------------------
::  Run this file from the project root after git clone.
::  SAFE AND IDEMPOTENT:
::    - Never overwrites an existing frontend/.env
::    - Never overwrites an existing backend/.env
::    - Installs Composer locally if no global Composer exists
::    - Enables/verifies required PHP extensions on Windows
::    - Creates PostgreSQL database only if missing
::    - Never drops or resets the database
::    - Runs migrations and creates the public storage link
::    - Launches backend + frontend and opens the browser
:: ============================================================

echo.
echo  =====================================================
echo   IU Events Management Platform -- Starting Up
echo   Islamic University of Madinah
echo  =====================================================
echo.

:: Resolve the project root from this script location.
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"

if not exist "%BACKEND%\composer.json" (
    echo   [ERROR] backend\composer.json was not found.
    echo           Run Start All.cmd from the project root.
    goto :ABORT
)

if not exist "%FRONTEND%\package.json" (
    echo   [ERROR] frontend\package.json was not found.
    echo           Run Start All.cmd from the project root.
    goto :ABORT
)

call :DETECT_PG_PATH

set "HAS_WINGET=0"
set "PG_SVC_NAME="
set "PG_READY=0"
set "COMPOSER_MODE=global"

where winget >nul 2>&1
if not errorlevel 1 set "HAS_WINGET=1"

:: ============================================================
:: Main control flow
:: 0 = OK, 1 = fatal error, 2 = rerun required
:: ============================================================

call :STEP_DEPS
if !errorlevel! EQU 2 goto :RESTART_MSG
if !errorlevel! EQU 1 goto :ABORT

call :STEP_ENV
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
echo   A system dependency was installed.
echo   Please close this window and run Start All.cmd again.
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
:: SUBROUTINE: OFFER_WINGET
:: Args: package id, friendly name, manual URL
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
winget install --id "%~1" -e --silent --accept-package-agreements --accept-source-agreements
set "_WINGET_RC=!errorlevel!"

if not "!_WINGET_RC!"=="0" (
    echo   [ERROR] winget could not install %~2.
    echo          Install it manually: %~3
    exit /b 0
)

echo   [OK] %~2 installed.
set "_WINGET_OK=1"
exit /b 0


:: ============================================================
:: SUBROUTINE: INSTALL_LOCAL_COMPOSER
:: Installs Composer as backend\composer.phar.
:: No PATH change or Windows restart is required.
:: ============================================================
:INSTALL_LOCAL_COMPOSER
set "_COMPOSER_PHAR=%BACKEND%\composer.phar"

echo   Downloading Composer locally to backend\composer.phar...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://getcomposer.org/download/latest-stable/composer.phar' -OutFile $env:_COMPOSER_PHAR"
set "_COMPOSER_DL_RC=!errorlevel!"

if not "!_COMPOSER_DL_RC!"=="0" (
    echo   [ERROR] Could not download Composer.
    echo          Manual download: https://getcomposer.org/download/
    if exist "%BACKEND%\composer.phar" del /q "%BACKEND%\composer.phar" >nul 2>&1
    exit /b 1
)

php "%BACKEND%\composer.phar" --version >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Downloaded composer.phar could not be executed.
    del /q "%BACKEND%\composer.phar" >nul 2>&1
    exit /b 1
)

for /f "tokens=1,2,3" %%a in ('php "%BACKEND%\composer.phar" --version 2^>nul') do set "_COMP_VER=%%a %%b %%c"
echo   [OK] !_COMP_VER! installed locally.
set "COMPOSER_MODE=local"
exit /b 0


:: ============================================================
:: STEP 1 -- System dependency checks
:: ============================================================
:STEP_DEPS
echo [Step 1/7] Checking system dependencies...
echo.

set "_ERR=0"
set "_NEED_RESTART=0"

:: ----- Node.js >= 18 -----
set "_HAVE_NODE=0"
where node >nul 2>&1
if not errorlevel 1 set "_HAVE_NODE=1"

if "!_HAVE_NODE!"=="0" (
    echo   [MISSING] Node.js ^>=18 is not installed.
    call :OFFER_WINGET "OpenJS.NodeJS.LTS" "Node.js LTS" "https://nodejs.org"
    if "!_WINGET_OK!"=="1" (
        set "_NEED_RESTART=1"
    ) else (
        set "_ERR=1"
    )
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


:: ----- npm -----
set "_HAVE_NPM=0"
where npm >nul 2>&1
if not errorlevel 1 set "_HAVE_NPM=1"

if "!_HAVE_NPM!"=="0" (
    echo   [MISSING] npm was not found. Reinstall Node.js: https://nodejs.org
    set "_ERR=1"
) else (
    for /f "tokens=*" %%v in ('npm --version 2^>nul') do set "_NPM_VER=%%v"
    echo   [OK] npm      v!_NPM_VER!
)


:: ----- PHP >= 8.3 -----
set "_HAVE_PHP=0"
where php >nul 2>&1
if not errorlevel 1 set "_HAVE_PHP=1"

if "!_HAVE_PHP!"=="0" (
    echo.
    echo   [MISSING] PHP ^>=8.3 is not installed.
    call :OFFER_WINGET "PHP.PHP.8.4" "PHP 8.4" "https://windows.php.net/download/"
    if "!_WINGET_OK!"=="1" (
        set "_NEED_RESTART=1"
    ) else (
        set "_ERR=1"
    )
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

    if exist "%BACKEND%\scripts\enable-php-extensions.php" (
        php "%BACKEND%\scripts\enable-php-extensions.php"
    )

    set "_EXT_MISS=0"
    for %%e in (intl xmlwriter pdo_pgsql openssl mbstring fileinfo curl gd sodium zip) do (
        php -m 2>nul ^| findstr /i "^%%e$" >nul 2>&1
        if errorlevel 1 (
            echo   [MISSING] PHP extension: %%e
            set "_EXT_MISS=1"
        )
    )

    if "!_EXT_MISS!"=="1" (
        echo.
        echo   [ERROR] Some required PHP extensions are still unavailable.
        echo          Check the active php.ini with: php --ini
        set "_ERR=1"
    ) else (
        echo   [OK] PHP extensions verified.
    )
)


:: ----- Composer -----
set "_HAVE_COMP=0"
set "COMPOSER_MODE=global"

where composer >nul 2>&1
if not errorlevel 1 (
    composer --version >nul 2>&1
    if not errorlevel 1 (
        set "_HAVE_COMP=1"
        for /f "tokens=1,2,3" %%a in ('composer --version 2^>nul') do set "_COMP_VER=%%a %%b %%c"
        echo   [OK] !_COMP_VER!
    )
)

if "!_HAVE_COMP!"=="0" (
    if exist "%BACKEND%\composer.phar" (
        php "%BACKEND%\composer.phar" --version >nul 2>&1
        if not errorlevel 1 (
            set "_HAVE_COMP=1"
            set "COMPOSER_MODE=local"
            for /f "tokens=1,2,3" %%a in ('php "%BACKEND%\composer.phar" --version 2^>nul') do set "_COMP_VER=%%a %%b %%c"
            echo   [OK] !_COMP_VER! - local backend\composer.phar
        )
    )
)

if "!_HAVE_COMP!"=="0" (
    echo.
    echo   [MISSING] Composer is not installed.
    call :INSTALL_LOCAL_COMPOSER
    if errorlevel 1 (
        set "_ERR=1"
    ) else (
        set "_HAVE_COMP=1"
    )
)


:: ----- PostgreSQL -----
echo.
echo   Checking PostgreSQL...
call :DETECT_PG_SERVICE

if "!PG_READY!"=="0" (
    if "!PG_SVC_NAME!"=="" (
        echo   [MISSING] PostgreSQL is not installed or no PostgreSQL service was found.
        call :OFFER_WINGET "PostgreSQL.PostgreSQL.16" "PostgreSQL 16" "https://www.postgresql.org/download/windows/"
        if "!_WINGET_OK!"=="1" (
            echo.
            echo   IMPORTANT: Remember the password selected for the 'postgres' user.
            echo   Start All.cmd will ask for it on the next run.
            set "_NEED_RESTART=1"
        ) else (
            set "_ERR=1"
        )
    ) else (
        echo   [ERROR] PostgreSQL service "!PG_SVC_NAME!" exists but is not reachable.
        echo          Try running Start All.cmd as Administrator or start the service manually.
        set "_ERR=1"
    )
)

echo.

if "!_NEED_RESTART!"=="1" exit /b 2
if "!_ERR!"=="1" exit /b 1
exit /b 0


:: ============================================================
:: SUBROUTINE: DETECT_PG_PATH
:: Adds a PostgreSQL bin directory to this process PATH if needed.
:: ============================================================
:DETECT_PG_PATH
where pg_isready >nul 2>&1
if not errorlevel 1 exit /b 0

if exist "%ProgramFiles%\PostgreSQL" (
    for /f "delims=" %%d in ('dir /b /ad /o-n "%ProgramFiles%\PostgreSQL" 2^>nul') do (
        if exist "%ProgramFiles%\PostgreSQL\%%d\bin\pg_isready.exe" (
            set "PATH=%ProgramFiles%\PostgreSQL\%%d\bin;%PATH%"
            exit /b 0
        )
    )
)

if exist "%ProgramFiles(x86)%\PostgreSQL" (
    for /f "delims=" %%d in ('dir /b /ad /o-n "%ProgramFiles(x86)%\PostgreSQL" 2^>nul') do (
        if exist "%ProgramFiles(x86)%\PostgreSQL\%%d\bin\pg_isready.exe" (
            set "PATH=%ProgramFiles(x86)%\PostgreSQL\%%d\bin;%PATH%"
            exit /b 0
        )
    )
)

exit /b 0


:: ============================================================
:: SUBROUTINE: DETECT_PG_SERVICE
:: ============================================================
:DETECT_PG_SERVICE
set "PG_READY=0"
set "PG_SVC_NAME="

where pg_isready >nul 2>&1
if not errorlevel 1 (
    pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
    if not errorlevel 1 (
        set "PG_READY=1"
        echo   [OK] PostgreSQL is running.
        exit /b 0
    )
)

for /f "usebackq delims=" %%s in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$s = Get-Service -ErrorAction SilentlyContinue | Where-Object { $_.Name -like 'postgresql*' -or $_.Name -like '*postgres*' } | Select-Object -First 1; if ($s) { $s.Name }"`) do (
    if "!PG_SVC_NAME!"=="" set "PG_SVC_NAME=%%s"
)

if not "!PG_SVC_NAME!"=="" (
    echo   PostgreSQL service "!PG_SVC_NAME!" is not ready. Attempting to start it...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Service -Name '!PG_SVC_NAME!' -ErrorAction Stop" >nul 2>&1

    ping 127.0.0.1 -n 3 >nul

    where pg_isready >nul 2>&1
    if not errorlevel 1 (
        pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
        if not errorlevel 1 (
            set "PG_READY=1"
            echo   [OK] PostgreSQL service started successfully.
            exit /b 0
        )
    )
)

exit /b 0


:: ============================================================
:: STEP 2 -- Environment files
:: Does not run Artisan yet because vendor/ may not exist.
:: ============================================================
:STEP_ENV
echo [Step 2/7] Configuring local environment...

:: ----- Frontend .env -----
if not exist "%FRONTEND%\.env" (
    echo   frontend\.env not found -- creating local configuration...
    (
        echo VITE_API_URL_CLIENT=http://127.0.0.1:8000
        echo VITE_API_URL_SERVER=http://127.0.0.1:8000
        echo VITE_FRONTEND_URL=http://localhost:5678
    ) > "%FRONTEND%\.env"
    echo   [OK] frontend\.env created.
) else (
    echo   [OK] frontend\.env exists -- not overwriting.
)


:: ----- Backend .env -----
if exist "%BACKEND%\.env" (
    echo   [OK] backend\.env exists -- not overwriting.
    echo.
    exit /b 0
)

if not exist "%BACKEND%\.env.example" (
    echo   [ERROR] backend\.env.example was not found.
    exit /b 1
)

echo   backend\.env not found -- creating from .env.example...
copy /y "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
if errorlevel 1 (
    echo   [ERROR] Could not create backend\.env.
    exit /b 1
)

set "_ENV_FILE=%BACKEND%\.env"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$f=$env:_ENV_FILE; $lines=Get-Content -LiteralPath $f; $out=$lines | ForEach-Object { if ($_ -match '^APP_KEY=') { 'APP_KEY=' } elseif ($_ -match '^JWT_SECRET=') { 'JWT_SECRET=' } elseif ($_ -match '^APP_URL=') { 'APP_URL=http://127.0.0.1:8000' } elseif ($_ -match '^APP_FRONTEND_URL=') { 'APP_FRONTEND_URL=http://localhost:5678' } elseif ($_ -match '^DB_HOST=') { 'DB_HOST=127.0.0.1' } elseif ($_ -match '^DB_USERNAME=') { 'DB_USERNAME=postgres' } elseif ($_ -match '^DB_PASSWORD=') { 'DB_PASSWORD=' } elseif ($_ -match '^FILESYSTEM_PUBLIC_DISK=') { 'FILESYSTEM_PUBLIC_DISK=public' } elseif ($_ -match '^FILESYSTEM_PRIVATE_DISK=') { 'FILESYSTEM_PRIVATE_DISK=local' } else { $_ } }; [IO.File]::WriteAllLines($f,[string[]]$out,(New-Object Text.UTF8Encoding($false)))"
if errorlevel 1 (
    echo   [ERROR] Could not configure backend\.env.
    exit /b 1
)

echo   [OK] backend\.env created with local defaults.
echo.
echo   ============================================================
echo    DATABASE PASSWORD SETUP (one-time only)
echo   ============================================================
echo    Enter the PostgreSQL password for user 'postgres'.
echo    Press Enter only if your postgres user has a blank password.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$p=Read-Host -Prompt '  PostgreSQL password for postgres'; $f=$env:_ENV_FILE; $lines=Get-Content -LiteralPath $f; $out=$lines | ForEach-Object { if ($_ -match '^DB_PASSWORD=') { 'DB_PASSWORD=' + $p } else { $_ } }; [IO.File]::WriteAllLines($f,[string[]]$out,(New-Object Text.UTF8Encoding($false))); Write-Host '  [OK] Password saved to backend\.env.'"
if errorlevel 1 (
    echo   [ERROR] Could not save the PostgreSQL password.
    exit /b 1
)

echo.
exit /b 0


:: ============================================================
:: STEP 3 -- Frontend dependencies
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

if not "!_NPM_RC!"=="0" (
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
:: STEP 4 -- Backend Composer dependencies + application keys
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

if "!_RUN_COMP!"=="1" (
    pushd "%BACKEND%"
    echo   Running composer install...

    if "!COMPOSER_MODE!"=="local" (
        php "%BACKEND%\composer.phar" install --no-interaction --prefer-dist --optimize-autoloader
    ) else (
        call composer install --no-interaction --prefer-dist --optimize-autoloader
    )

    set "_COMP_RC=!errorlevel!"
    popd

    if not "!_COMP_RC!"=="0" (
        echo   [ERROR] composer install failed with exit code !_COMP_RC!.
        echo          Platform requirements are NOT being ignored.
        exit /b 1
    )

    if exist "!_COMP_LOCK!" (
        set "_COMP_LOCK_PATH=!_COMP_LOCK!"
        for /f "delims=" %%h in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-FileHash $env:_COMP_LOCK_PATH -Algorithm SHA256).Hash"') do echo %%h>"!_COMP_STAMP!"
    )

    echo   [OK] Composer packages ready.
) else (
    echo   [OK] vendor matches composer.lock -- skipping install.
)

call :GENERATE_APP_KEYS
if errorlevel 1 exit /b 1

echo.
exit /b 0


:: ============================================================
:: SUBROUTINE: GENERATE_APP_KEYS
:: Runs only after Composer dependencies exist.
:: ============================================================
:GENERATE_APP_KEYS
if not exist "%BACKEND%\vendor\autoload.php" (
    echo   [ERROR] backend\vendor\autoload.php is missing.
    echo          Composer dependencies must be installed first.
    exit /b 1
)

if not exist "%BACKEND%\.env" (
    echo   [ERROR] backend\.env is missing.
    exit /b 1
)

set "_KEY_MISSING=1"
for /f "tokens=1,* delims==" %%a in ('findstr /i "^APP_KEY=" "%BACKEND%\.env"') do (
    if not "%%b"=="" set "_KEY_MISSING=0"
)

if "!_KEY_MISSING!"=="1" (
    echo   APP_KEY is blank -- generating a fresh key...
    pushd "%BACKEND%"
    php artisan key:generate --no-interaction --force
    set "_KEY_RC=!errorlevel!"
    popd

    if not "!_KEY_RC!"=="0" (
        echo   [ERROR] artisan key:generate failed.
        exit /b 1
    )
    echo   [OK] Fresh APP_KEY generated.
) else (
    echo   [OK] APP_KEY already set.
)

set "_JWT_MISSING=1"
for /f "tokens=1,* delims==" %%a in ('findstr /i "^JWT_SECRET=" "%BACKEND%\.env"') do (
    if not "%%b"=="" set "_JWT_MISSING=0"
)

if "!_JWT_MISSING!"=="1" (
    echo   JWT_SECRET is blank -- generating a fresh secret...
    pushd "%BACKEND%"
    php artisan jwt:secret --no-interaction --force
    set "_JWT_RC=!errorlevel!"
    popd

    if not "!_JWT_RC!"=="0" (
        echo   [ERROR] artisan jwt:secret failed.
        exit /b 1
    )
    echo   [OK] Fresh JWT_SECRET generated.
) else (
    echo   [OK] JWT_SECRET already set.
)

exit /b 0


:: ============================================================
:: STEP 5 -- Database
:: ============================================================
:STEP_DB
echo [Step 5/7] Verifying database connection...

if exist "%BACKEND%\scripts\ensure-database.php" (
    php "%BACKEND%\scripts\ensure-database.php"
    if errorlevel 1 (
        echo.
        echo   [ERROR] Failed to connect to or create the database.
        echo   Please verify:
        echo     1. PostgreSQL service is running.
        echo     2. DB_PASSWORD in backend\.env is correct.
        exit /b 1
    )
) else (
    pushd "%BACKEND%"
    php artisan db:show >nul 2>&1
    set "_DB_RC=!errorlevel!"
    popd

    if not "!_DB_RC!"=="0" (
        echo   [ERROR] Cannot connect to the database.
        exit /b 1
    )
)

echo.
exit /b 0


:: ============================================================
:: STEP 6 -- Migrations and storage
:: ============================================================
:STEP_MIGRATE
echo [Step 6/7] Running database migrations and setting up storage...

pushd "%BACKEND%"
php artisan migrate --no-interaction --force
set "_MIG_RC=!errorlevel!"

if not "!_MIG_RC!"=="0" (
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
:: STEP 7 -- Launch
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
start "" "http://localhost:5678"

echo.
echo  ====================================================
echo.
echo   IU Events Platform is UP and RUNNING!
echo.
echo   Frontend  :  http://localhost:5678
echo   Backend   :  http://127.0.0.1:8000
echo.
echo   Two terminal windows are running:
echo     - IU Events -- Laravel Backend  (port 8000)
echo     - IU Events -- React Frontend   (port 5678)
echo.
echo   Keep both windows open while using the application.
echo   Close those windows to stop the servers.
echo.
echo  ====================================================
echo.
pause
exit /b 0
