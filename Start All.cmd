@echo off
setlocal enabledelayedexpansion
title IU Events Platform -- Startup

:: ============================================================
::  IU Events Management Platform -- Start All
::  Islamic University of Madinah
::  --------------------------------------------------------
::  Run this file from the project root after cloning.
::  SAFE and IDEMPOTENT:
::    - Never overwrites backend/.env
::    - Never resets or drops the database
::    - Only installs packages when lock files change
::    - Generates fresh secrets on first run
:: ============================================================

echo.
echo  =====================================================
echo   IU Events Management Platform -- Starting Up
echo   Islamic University of Madinah
echo  =====================================================
echo.

:: Resolve script directory (works even with spaces in path)
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"
set "HAD_ERROR=0"

:: ============================================================
:: STEP 1 -- SYSTEM DEPENDENCY CHECKS
:: ============================================================
echo [Step 1/7] Checking system dependencies...
echo.

:: ===========================================================
:: 1a. Node.js
:: ===========================================================
where node >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] Node.js is not installed.
    echo            Node.js ^>=18 is required for the React frontend.
    echo.
    choice /c YN /m "  Install Node.js LTS via winget now?"
    if errorlevel 2 (
        echo   [ERROR] Node.js is required. Install from: https://nodejs.org
        set "HAD_ERROR=1"
        goto :check_npm
    )
    winget install --id OpenJS.NodeJS.LTS -e --silent
    if errorlevel 1 (
        echo   [ERROR] winget install failed. Install Node.js from: https://nodejs.org
        set "HAD_ERROR=1"
    ) else (
        echo   [OK] Node.js installed. Restart this script to continue.
        pause & exit /b 0
    )
) else (
    for /f "tokens=*" %%v in ('node --version 2^>nul') do set "NODE_VER=%%v"
    echo   [OK] Node.js  !NODE_VER!
)

:: ===========================================================
:: 1b. npm
:: ===========================================================
:check_npm
where npm >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] npm not found. Reinstall Node.js from: https://nodejs.org
    set "HAD_ERROR=1"
) else (
    for /f "tokens=*" %%v in ('npm --version 2^>nul') do set "NPM_VER=%%v"
    echo   [OK] npm      v!NPM_VER!
)

:: ===========================================================
:: 1c. PHP -- must exist AND be >=8.3 AND have required exts
:: ===========================================================
where php >nul 2>&1
if errorlevel 1 (
    echo.
    echo   [MISSING] PHP is not installed. PHP ^>=8.3 is required.
    echo.
    choice /c YN /m "  Install PHP 8.4 via winget now?"
    if errorlevel 2 (
        echo   [ERROR] PHP is required. Install from: https://windows.php.net
        set "HAD_ERROR=1"
        goto :check_composer
    )
    winget install --id PHP.PHP.8.4 -e --silent
    if errorlevel 1 (
        echo   [ERROR] winget install failed. Install PHP from: https://windows.php.net
        set "HAD_ERROR=1"
    ) else (
        echo   [OK] PHP installed. Restart this script to continue.
        pause & exit /b 0
    )
    goto :check_composer
)

:: PHP is installed -- check version >=8.3
for /f "tokens=2" %%v in ('php --version 2^>nul ^| findstr /i "^PHP"') do set "PHP_RAW=%%v"
:: PHP_RAW is like 8.4.1 -- extract major and minor
for /f "tokens=1,2 delims=." %%a in ("!PHP_RAW!") do (
    set "PHP_MAJOR=%%a"
    set "PHP_MINOR=%%b"
)
echo   [OK] PHP !PHP_RAW!
set "PHP_OK=1"
if !PHP_MAJOR! LSS 8 set "PHP_OK=0"
if !PHP_MAJOR! EQU 8 if !PHP_MINOR! LSS 3 set "PHP_OK=0"
if "!PHP_OK!"=="0" (
    echo   [ERROR] PHP !PHP_RAW! is too old. PHP ^>=8.3 is required.
    echo          Install PHP 8.4 from: https://windows.php.net
    echo          Or run:  winget install --id PHP.PHP.8.4 -e
    set "HAD_ERROR=1"
    goto :check_composer
)

:: Check required PHP extensions
echo   Checking PHP extensions...
set "EXT_ERRORS=0"

php -m 2>nul | findstr /i "^intl$" >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] PHP extension: intl
    set "EXT_ERRORS=1"
)

php -m 2>nul | findstr /i "^xmlwriter$" >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] PHP extension: xmlwriter
    set "EXT_ERRORS=1"
)

php -m 2>nul | findstr /i "^pdo_pgsql$" >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] PHP extension: pdo_pgsql
    set "EXT_ERRORS=1"
)

php -m 2>nul | findstr /i "^pgsql$" >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] PHP extension: pgsql
    set "EXT_ERRORS=1"
)

php -m 2>nul | findstr /i "^openssl$" >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] PHP extension: openssl
    set "EXT_ERRORS=1"
)

php -m 2>nul | findstr /i "^mbstring$" >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] PHP extension: mbstring
    set "EXT_ERRORS=1"
)

if "!EXT_ERRORS!"=="1" (
    echo.
    echo   [ACTION REQUIRED] One or more PHP extensions are missing.
    echo   To enable them, edit your php.ini and uncomment the relevant lines:
    echo.
    echo     extension=intl
    echo     extension=pdo_pgsql
    echo     extension=pgsql
    echo     extension=openssl
    echo     extension=mbstring
    echo     extension=xmlwriter
    echo.
    echo   Find your php.ini path with:  php --ini
    echo   After editing, restart this script.
    set "HAD_ERROR=1"
) else (
    echo   [OK] Required PHP extensions present.
)

:: ===========================================================
:: 1d. Composer
:: ===========================================================
:check_composer
set "COMPOSER_CMD=composer"
where composer >nul 2>&1
if errorlevel 1 (
    if exist "%BACKEND%\composer.phar" (
        set "COMPOSER_CMD=php "%BACKEND%\composer.phar""
        echo   [OK] Composer  (local composer.phar in backend/)
    ) else (
        echo.
        echo   [MISSING] Composer is not installed.
        echo.
        choice /c YN /m "  Install Composer via winget now?"
        if errorlevel 2 (
            echo   [ERROR] Composer required. Install from: https://getcomposer.org
            set "HAD_ERROR=1"
            goto :check_pg
        )
        winget install --id Composer.Composer -e --silent
        if errorlevel 1 (
            echo   [ERROR] winget install failed. Install from: https://getcomposer.org
            set "HAD_ERROR=1"
        ) else (
            echo   [OK] Composer installed. Restart this script to continue.
            pause & exit /b 0
        )
    )
) else (
    for /f "tokens=1,2,3" %%a in ('composer --version 2^>nul') do set "COMP_VER=%%a %%b %%c"
    echo   [OK] !COMP_VER!
)

:: ===========================================================
:: 1e. PostgreSQL -- detect install + service + pg_isready
:: ===========================================================
:check_pg
echo.
echo   Checking PostgreSQL...

set "PG_SERVICE_FOUND=0"
set "PG_READY=0"

:: Try pg_isready (shipped with PostgreSQL client tools)
where pg_isready >nul 2>&1
if not errorlevel 1 (
    pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
    if not errorlevel 1 (
        set "PG_READY=1"
        echo   [OK] PostgreSQL is running (pg_isready confirmed).
    )
)

:: If pg_isready not found or failed, check Windows service
if "!PG_READY!"=="0" (
    for /f "tokens=*" %%s in ('sc query type^= all 2^>nul ^| findstr /i "postgresql"') do (
        set "PG_SERVICE_FOUND=1"
    )
    if "!PG_SERVICE_FOUND!"=="1" (
        :: Found a service -- check if it is running
        sc query type= all | findstr /i "postgresql" >nul 2>&1
        for /f "tokens=4" %%s in ('sc query type^= all state^= all 2^>nul ^| findstr /i "STATE"') do (
            if /i "%%s"=="RUNNING" set "PG_READY=1"
        )
        if "!PG_READY!"=="1" (
            echo   [OK] PostgreSQL service is running.
        ) else (
            echo   [WARNING] PostgreSQL service found but not running.
            echo            Attempting to start it...
            :: Try common service names
            net start postgresql-x64-17 >nul 2>&1
            if errorlevel 1 net start postgresql-x64-16 >nul 2>&1
            if errorlevel 1 net start postgresql-x64-15 >nul 2>&1
            if errorlevel 1 net start postgresql-x64-14 >nul 2>&1
            :: Re-check
            where pg_isready >nul 2>&1
            if not errorlevel 1 (
                pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
                if not errorlevel 1 set "PG_READY=1"
            )
            if "!PG_READY!"=="1" (
                echo   [OK] PostgreSQL service started.
            ) else (
                echo   [ERROR] Could not start PostgreSQL service.
                echo          Open Services (services.msc) and start the postgresql service manually,
                echo          then re-run this script.
                set "HAD_ERROR=1"
            )
        )
    ) else (
        :: PostgreSQL not found at all
        echo   [MISSING] PostgreSQL does not appear to be installed.
        echo.
        choice /c YN /m "  Install PostgreSQL 16 via winget now?"
        if errorlevel 2 (
            echo   [ERROR] PostgreSQL is required. Install from: https://www.postgresql.org/download/windows/
            set "HAD_ERROR=1"
            goto :pg_done
        )
        winget install --id PostgreSQL.PostgreSQL.16 -e
        if errorlevel 1 (
            echo   [ERROR] winget install failed.
            echo          Install PostgreSQL manually from: https://www.postgresql.org/download/windows/
            set "HAD_ERROR=1"
        ) else (
            echo.
            echo   [OK] PostgreSQL installed.
            echo.
            echo   IMPORTANT: The PostgreSQL installer will have asked you to set a
            echo   superuser (postgres) password. Remember it -- you will need it below.
            echo.
            echo   Restart this script after PostgreSQL setup is complete.
            pause & exit /b 0
        )
    )
)
:pg_done
echo.

:: ============================================================
:: Abort if any critical dependency is still missing
:: ============================================================
if "!HAD_ERROR!"=="1" (
    echo  ====================================================
    echo   [ABORTED] One or more dependencies are missing.
    echo   Fix the issues listed above, then re-run this script.
    echo  ====================================================
    echo.
    pause & exit /b 1
)

:: ============================================================
:: STEP 2 -- FRONTEND: Install / sync packages
:: ============================================================
echo [Step 2/7] Frontend -- syncing npm packages...

pushd "%FRONTEND%"

:: Use npm ci when package-lock.json exists (reproducible install)
:: Fall back to npm install when lock file absent (first developer run)
if exist "%FRONTEND%\package-lock.json" (
    :: Only run ci if node_modules is absent OR lock file is newer than node_modules
    set "RUN_NPM=0"
    if not exist "%FRONTEND%\node_modules" set "RUN_NPM=1"
    if "!RUN_NPM!"=="0" (
        :: Compare modification times via xcopy dry-run trick is unreliable in batch;
        :: use a sentinel file instead: write a hash file after install
        if not exist "%FRONTEND%\node_modules\.install_stamp" set "RUN_NPM=1"
    )
    if "!RUN_NPM!"=="1" (
        echo   Running npm ci (reproducible install from package-lock.json)...
        npm ci
        if errorlevel 1 (
            echo   [ERROR] npm ci failed. See output above.
            popd & pause & exit /b 1
        )
        echo. > "%FRONTEND%\node_modules\.install_stamp"
        echo   [OK] npm packages installed (npm ci).
    ) else (
        echo   [OK] node_modules up to date -- skipping install.
    )
) else (
    if not exist "%FRONTEND%\node_modules" (
        echo   Running npm install (no lock file found)...
        npm install
        if errorlevel 1 (
            echo   [ERROR] npm install failed. See output above.
            popd & pause & exit /b 1
        )
        echo   [OK] npm packages installed.
    ) else (
        echo   [OK] node_modules present -- skipping install.
    )
)
popd
echo.

:: ============================================================
:: STEP 3 -- BACKEND: Install / sync Composer packages
:: ============================================================
echo [Step 3/7] Backend -- syncing Composer packages...

pushd "%BACKEND%"

set "RUN_COMPOSER=0"
if not exist "%BACKEND%\vendor" (
    set "RUN_COMPOSER=1"
) else (
    if not exist "%BACKEND%\vendor\.composer_stamp" set "RUN_COMPOSER=1"
)

if "!RUN_COMPOSER!"=="1" (
    echo   Running composer install...
    %COMPOSER_CMD% install --no-interaction --prefer-dist --optimize-autoloader
    if errorlevel 1 (
        echo   [ERROR] composer install failed. See output above.
        popd & pause & exit /b 1
    )
    echo. > "%BACKEND%\vendor\.composer_stamp"
    echo   [OK] Composer packages installed.
) else (
    echo   [OK] vendor/ up to date -- skipping install.
)
popd
echo.

:: ============================================================
:: STEP 4 -- ENVIRONMENT: backend/.env (NEVER overwrites)
:: ============================================================
echo [Step 4/7] Environment configuration...

if not exist "%BACKEND%\.env" (
    echo   backend/.env not found.
    echo   Copying .env.example to .env...
    copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul

    :: -------------------------------------------------------
    :: Blank out the example secrets so they MUST be replaced.
    :: The artisan commands below will generate fresh values.
    :: -------------------------------------------------------
    powershell -NoProfile -Command ^
        "(Get-Content '%BACKEND%\.env') -replace '^APP_KEY=.*','APP_KEY=' -replace '^JWT_SECRET=.*','JWT_SECRET=' -replace '^DB_HOST=pgsql','DB_HOST=127.0.0.1' -replace '^DB_USERNAME=username','DB_USERNAME=postgres' -replace '^DB_PASSWORD=password','DB_PASSWORD=' -replace '^APP_FRONTEND_URL=.*','APP_FRONTEND_URL=http://localhost:5678' | Set-Content '%BACKEND%\.env'"

    echo   [OK] .env created (example secrets cleared, local defaults applied).
    echo.
    echo   ============================================================
    echo    ACTION REQUIRED -- Set your PostgreSQL password
    echo   ============================================================
    echo.
    echo    Open backend/.env and set your local postgres password:
    echo.
    echo      DB_PASSWORD=your_postgres_password_here
    echo.
    echo    Other defaults already applied:
    echo      DB_HOST=127.0.0.1
    echo      DB_PORT=5432
    echo      DB_DATABASE=backend
    echo      DB_USERNAME=postgres
    echo      APP_FRONTEND_URL=http://localhost:5678
    echo.
    echo    Save backend/.env, then re-run this script.
    echo    APP_KEY and JWT_SECRET will be auto-generated on next run.
    echo   ============================================================
    echo.
    pause & exit /b 0
) else (
    echo   [OK] backend/.env exists -- not overwriting.
)

:: -- Generate fresh APP_KEY only if missing or blank --
set "KEY_MISSING=1"
for /f "tokens=1,* delims==" %%a in ('findstr /i "^APP_KEY=" "%BACKEND%\.env"') do (
    set "KEY_VAL=%%b"
    if not "!KEY_VAL!"=="" set "KEY_MISSING=0"
)
if "!KEY_MISSING!"=="1" (
    echo   APP_KEY missing -- generating fresh key...
    pushd "%BACKEND%"
    php artisan key:generate --no-interaction --force
    if errorlevel 1 (
        echo   [ERROR] key:generate failed.
        popd & pause & exit /b 1
    )
    popd
    echo   [OK] Fresh APP_KEY generated.
) else (
    echo   [OK] APP_KEY already set.
)

:: -- Generate fresh JWT_SECRET only if missing or blank --
set "JWT_MISSING=1"
for /f "tokens=1,* delims==" %%a in ('findstr /i "^JWT_SECRET=" "%BACKEND%\.env"') do (
    set "JWT_VAL=%%b"
    if not "!JWT_VAL!"=="" set "JWT_MISSING=0"
)
if "!JWT_MISSING!"=="1" (
    echo   JWT_SECRET missing -- generating fresh secret...
    pushd "%BACKEND%"
    php artisan jwt:secret --no-interaction --force
    if errorlevel 1 (
        echo   [ERROR] jwt:secret failed.
        popd & pause & exit /b 1
    )
    popd
    echo   [OK] Fresh JWT_SECRET generated.
) else (
    echo   [OK] JWT_SECRET already set.
)
echo.

:: ============================================================
:: STEP 5 -- DATABASE: verify connection + create if needed
:: ============================================================
echo [Step 5/7] Verifying database connection...

:: Read DB values from .env (tokens=1,* preserves values with spaces)
for /f "usebackq tokens=1,* delims==" %%a in ("%BACKEND%\.env") do (
    if /i "%%a"=="DB_HOST"     set "DB_HOST=%%b"
    if /i "%%a"=="DB_PORT"     set "DB_PORT=%%b"
    if /i "%%a"=="DB_DATABASE" set "DB_DATABASE=%%b"
    if /i "%%a"=="DB_USERNAME" set "DB_USERNAME=%%b"
    if /i "%%a"=="DB_PASSWORD" set "DB_PASSWORD=%%b"
)
:: Trim trailing whitespace from values
for /f "tokens=1" %%v in ("!DB_HOST!")     do set "DB_HOST=%%v"
for /f "tokens=1" %%v in ("!DB_PORT!")     do set "DB_PORT=%%v"
for /f "tokens=1" %%v in ("!DB_DATABASE!") do set "DB_DATABASE=%%v"
for /f "tokens=1" %%v in ("!DB_USERNAME!") do set "DB_USERNAME=%%v"

echo   DB_HOST:      !DB_HOST!
echo   DB_PORT:      !DB_PORT!
echo   DB_DATABASE:  !DB_DATABASE!
echo   DB_USERNAME:  !DB_USERNAME!
echo   DB_PASSWORD:  (set in .env)
echo.

:: Test connection to the configured database via Laravel
pushd "%BACKEND%"
php artisan db:show >nul 2>&1
set "DB_CONNECT_OK=!errorlevel!"
popd

if "!DB_CONNECT_OK!"=="0" (
    echo   [OK] Database "!DB_DATABASE!" connection verified.
) else (
    echo   [WARNING] Could not connect to database "!DB_DATABASE!".
    echo.
    :: Try connecting to the default 'postgres' database to check if
    :: the server itself is reachable (the target DB may just not exist yet)
    where psql >nul 2>&1
    if not errorlevel 1 (
        set "PGPASSWORD=!DB_PASSWORD!"
        psql -h !DB_HOST! -p !DB_PORT! -U !DB_USERNAME! -d postgres -c "" >nul 2>&1
        if not errorlevel 1 (
            echo   PostgreSQL server reachable. Database "!DB_DATABASE!" may not exist yet.
            echo.
            choice /c YN /m "  Create database '!DB_DATABASE!' now?"
            if not errorlevel 2 (
                psql -h !DB_HOST! -p !DB_PORT! -U !DB_USERNAME! -d postgres -c "CREATE DATABASE \"!DB_DATABASE!\";" 2>&1
                if errorlevel 1 (
                    echo   [ERROR] Failed to create database. It may already exist or you lack permission.
                    echo          Create it manually:  createdb -U !DB_USERNAME! !DB_DATABASE!
                    pause & exit /b 1
                )
                echo   [OK] Database "!DB_DATABASE!" created.
            ) else (
                echo   [INFO] Skipped. Create the database manually:
                echo          createdb -U !DB_USERNAME! !DB_DATABASE!
                pause & exit /b 1
            )
        ) else (
            echo   [ERROR] Cannot reach PostgreSQL server at !DB_HOST!:!DB_PORT!.
            echo.
            echo   Check:
            echo     1. PostgreSQL service is running (services.msc)
            echo     2. backend/.env: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD are correct
            echo     3. If DB_PASSWORD is blank in .env, set it to your postgres password.
            pause & exit /b 1
        )
        set "PGPASSWORD="
    ) else (
        echo   [ERROR] Cannot connect to the database.
        echo          psql not in PATH so automatic DB creation is unavailable.
        echo.
        echo   Check:
        echo     1. PostgreSQL service is running (services.msc)
        echo     2. backend/.env credentials (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD)
        echo     3. The database "!DB_DATABASE!" exists
        echo          Create it:  createdb -U postgres !DB_DATABASE!
        echo.
        pause & exit /b 1
    )
)
echo.

:: ============================================================
:: STEP 6 -- MIGRATIONS (safe, never drops or resets)
:: ============================================================
echo [Step 6/7] Running database migrations...

pushd "%BACKEND%"
php artisan migrate --no-interaction --force
if errorlevel 1 (
    echo.
    echo   [ERROR] Migrations failed. See output above.
    echo          Your existing data has NOT been modified.
    popd & pause & exit /b 1
)
popd
echo   [OK] Migrations complete.
echo.

:: ============================================================
:: STEP 7 -- LAUNCH SERVERS in separate terminal windows
:: ============================================================
echo [Step 7/7] Launching servers...

:: Backend window -- quote the entire cmd /k argument to handle spaces in path
echo   Starting Laravel backend  (http://127.0.0.1:8000) ...
start "IU Events -- Laravel Backend" cmd /k ^
    "title IU Events -- Laravel Backend ^& cd /d ""%BACKEND%"" ^& php artisan serve --host=127.0.0.1 --port=8000"

timeout /t 2 /nobreak >nul

:: Frontend window
echo   Starting React frontend   (http://localhost:5678) ...
start "IU Events -- React Frontend" cmd /k ^
    "title IU Events -- React Frontend ^& cd /d ""%FRONTEND%"" ^& npm run dev:csr"

timeout /t 3 /nobreak >nul

:: ============================================================
:: ALL DONE
:: ============================================================
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
echo   Close those two windows to stop the servers.
echo.
echo  ====================================================
echo.
pause
exit /b 0
