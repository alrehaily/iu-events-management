@echo off
setlocal enabledelayedexpansion
title IU Events Platform -- Startup

:: ============================================================
::  IU Events Management Platform -- Start All
::  Islamic University of Madinah
::  --------------------------------------------------------
::  Run this file from the project root after cloning.
::  It is SAFE and IDEMPOTENT -- it will never overwrite
::  your .env or reset your database.
:: ============================================================

echo.
echo  =====================================================
echo   IU Events Management Platform -- Starting Up
echo   Islamic University of Madinah
echo  =====================================================
echo.

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"
set "ERRORS=0"

:: ============================================================
:: STEP 1 -- CHECK REQUIRED SYSTEM DEPENDENCIES
:: ============================================================
echo [Step 1/7] Checking system dependencies...
echo.

:: --- Node.js ---
where node >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] Node.js is not installed.
    echo            Node.js is required to run the React frontend.
    echo.
    set /p INSTALL_NODE="  Install Node.js LTS via winget now? (y/n): "
    if /i "!INSTALL_NODE!"=="y" (
        winget install --id OpenJS.NodeJS.LTS -e --silent
        if errorlevel 1 (
            echo   [ERROR] Failed to install Node.js. Get it from: https://nodejs.org
            set "ERRORS=1"
        ) else (
            echo   [OK] Node.js installed. Please restart this script.
            pause & exit /b 0
        )
    ) else (
        echo   [ERROR] Node.js is required. Get it from: https://nodejs.org
        set "ERRORS=1"
    )
) else (
    for /f "tokens=*" %%v in ('node --version 2^>nul') do set "NODE_VER=%%v"
    echo   [OK] Node.js  !NODE_VER!
)

:: --- npm ---
where npm >nul 2>&1
if errorlevel 1 (
    echo   [MISSING] npm not found. Reinstall Node.js from: https://nodejs.org
    set "ERRORS=1"
) else (
    for /f "tokens=*" %%v in ('npm --version 2^>nul') do set "NPM_VER=%%v"
    echo   [OK] npm      v!NPM_VER!
)

:: --- PHP ---
where php >nul 2>&1
if errorlevel 1 (
    echo.
    echo   [MISSING] PHP is not installed. PHP ^>=8.3 is required.
    echo.
    set /p INSTALL_PHP="  Install PHP 8.4 via winget now? (y/n): "
    if /i "!INSTALL_PHP!"=="y" (
        winget install --id PHP.PHP.8.4 -e --silent
        if errorlevel 1 (
            echo   [ERROR] Failed to install PHP. Get it from: https://windows.php.net
            set "ERRORS=1"
        ) else (
            echo   [OK] PHP installed. Please restart this script.
            pause & exit /b 0
        )
    ) else (
        echo   [ERROR] PHP ^>=8.3 is required. Get it from: https://windows.php.net
        set "ERRORS=1"
    )
) else (
    for /f "tokens=*" %%v in ('php --version 2^>nul ^| findstr /i "^PHP"') do (
        set "PHP_VER=%%v"
        goto :php_ver_done
    )
    :php_ver_done
    echo   [OK] !PHP_VER!
)

:: --- Composer ---
set "COMPOSER_CMD=composer"
where composer >nul 2>&1
if errorlevel 1 (
    if exist "%BACKEND%\composer.phar" (
        set "COMPOSER_CMD=php %BACKEND%\composer.phar"
        echo   [OK] Composer  (local composer.phar in backend/)
    ) else (
        echo.
        echo   [MISSING] Composer is not installed.
        echo.
        set /p INSTALL_COMP="  Install Composer via winget now? (y/n): "
        if /i "!INSTALL_COMP!"=="y" (
            winget install --id Composer.Composer -e --silent
            if errorlevel 1 (
                echo   [ERROR] Failed to install Composer. Get it from: https://getcomposer.org
                set "ERRORS=1"
            ) else (
                echo   [OK] Composer installed. Please restart this script.
                pause & exit /b 0
            )
        ) else (
            echo   [ERROR] Composer is required. Get it from: https://getcomposer.org
            set "ERRORS=1"
        )
    )
) else (
    for /f "tokens=*" %%v in ('composer --version 2^>nul ^| findstr /i "^Composer"') do (
        set "COMP_VER=%%v"
        goto :comp_ver_done
    )
    :comp_ver_done
    echo   [OK] !COMP_VER!
)

:: --- PostgreSQL psql (optional check) ---
where psql >nul 2>&1
if errorlevel 1 (
    echo   [WARNING] psql not found in PATH -- database check will use Laravel instead.
) else (
    for /f "tokens=*" %%v in ('psql --version 2^>nul') do set "PSQL_VER=%%v"
    echo   [OK] !PSQL_VER!
)

echo.
if "!ERRORS!"=="1" (
    echo  [ABORTED] Required dependencies are missing. Install them then re-run.
    echo.
    pause & exit /b 1
)

:: ============================================================
:: STEP 2 -- FRONTEND: npm install (only if needed)
:: ============================================================
echo [Step 2/7] Frontend -- npm packages...

if not exist "%FRONTEND%\node_modules" (
    echo   node_modules not found -- running npm install...
    pushd "%FRONTEND%"
    npm install
    if errorlevel 1 (
        echo   [ERROR] npm install failed. See output above.
        popd & pause & exit /b 1
    )
    popd
    echo   [OK] npm packages installed.
) else (
    echo   [OK] node_modules present -- skipping npm install.
)
echo.

:: ============================================================
:: STEP 3 -- BACKEND: composer install (only if needed)
:: ============================================================
echo [Step 3/7] Backend -- Composer packages...

if not exist "%BACKEND%\vendor" (
    echo   vendor/ not found -- running composer install...
    pushd "%BACKEND%"
    !COMPOSER_CMD! install --no-interaction --prefer-dist --optimize-autoloader
    if errorlevel 1 (
        echo   [ERROR] composer install failed. See output above.
        popd & pause & exit /b 1
    )
    popd
    echo   [OK] Composer packages installed.
) else (
    echo   [OK] vendor/ present -- skipping composer install.
)
echo.

:: ============================================================
:: STEP 4 -- ENVIRONMENT: .env setup (NEVER overwrites)
:: ============================================================
echo [Step 4/7] Environment configuration...

if not exist "%BACKEND%\.env" (
    echo   backend/.env not found -- copying from .env.example...
    copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
    echo.
    echo   ============================================================
    echo    ACTION REQUIRED -- Edit backend/.env before continuing
    echo   ============================================================
    echo    Set your PostgreSQL credentials:
    echo.
    echo      DB_HOST=127.0.0.1
    echo      DB_PORT=5432
    echo      DB_DATABASE=backend
    echo      DB_USERNAME=postgres
    echo      DB_PASSWORD=your_password_here
    echo.
    echo    Also set the frontend URL:
    echo      APP_FRONTEND_URL=http://localhost:5678
    echo.
    echo    After saving backend/.env, re-run this script.
    echo   ============================================================
    echo.
    pause & exit /b 0
) else (
    echo   [OK] backend/.env exists -- not overwriting.
)

:: Generate APP_KEY only if missing
findstr /i "APP_KEY=base64:" "%BACKEND%\.env" >nul 2>&1
if errorlevel 1 (
    echo   APP_KEY missing -- generating...
    pushd "%BACKEND%"
    php artisan key:generate --no-interaction
    if errorlevel 1 ( echo   [ERROR] key:generate failed. & popd & pause & exit /b 1 )
    popd
    echo   [OK] APP_KEY generated.
) else (
    echo   [OK] APP_KEY already set.
)

:: Generate JWT_SECRET only if missing/blank
set "JWT_MISSING=0"
findstr /i "JWT_SECRET=" "%BACKEND%\.env" >nul 2>&1
if errorlevel 1 ( set "JWT_MISSING=1" )
if "!JWT_MISSING!"=="0" (
    for /f "tokens=2 delims==" %%v in ('findstr /i "JWT_SECRET=" "%BACKEND%\.env"') do set "JWT_VAL=%%v"
    if "!JWT_VAL!"=="" set "JWT_MISSING=1"
)
if "!JWT_MISSING!"=="1" (
    echo   JWT_SECRET missing -- generating...
    pushd "%BACKEND%"
    php artisan jwt:secret --no-interaction --force
    if errorlevel 1 ( echo   [ERROR] jwt:secret failed. & popd & pause & exit /b 1 )
    popd
    echo   [OK] JWT_SECRET generated.
) else (
    echo   [OK] JWT_SECRET already set.
)
echo.

:: ============================================================
:: STEP 5 -- POSTGRESQL: verify connection via Laravel
:: ============================================================
echo [Step 5/7] Verifying database connection...

for /f "usebackq tokens=1,* delims==" %%a in ("%BACKEND%\.env") do (
    if /i "%%a"=="DB_HOST"     set "DB_HOST=%%b"
    if /i "%%a"=="DB_PORT"     set "DB_PORT=%%b"
    if /i "%%a"=="DB_DATABASE" set "DB_DATABASE=%%b"
    if /i "%%a"=="DB_USERNAME" set "DB_USERNAME=%%b"
)
echo   DB_HOST:      !DB_HOST!
echo   DB_PORT:      !DB_PORT!
echo   DB_DATABASE:  !DB_DATABASE!
echo   DB_USERNAME:  !DB_USERNAME!
echo.

pushd "%BACKEND%"
php artisan db:show >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Cannot connect to PostgreSQL.
    echo.
    echo   Please check:
    echo     1. PostgreSQL service is running
    echo        (open Services and look for "postgresql-x64-...")
    echo     2. backend/.env has correct DB_HOST, DB_PORT,
    echo        DB_DATABASE, DB_USERNAME, DB_PASSWORD
    echo.
    popd & pause & exit /b 1
)
popd
echo   [OK] Database connection verified.
echo.

:: ============================================================
:: STEP 6 -- DATABASE MIGRATIONS (safe, no drops/resets)
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
:: STEP 7 -- LAUNCH SERVERS in separate windows
:: ============================================================
echo [Step 7/7] Launching servers...

echo   Starting Laravel backend  (http://127.0.0.1:8000) ...
start "IU Events -- Laravel Backend" cmd /k "title IU Events -- Laravel Backend && cd /d "%BACKEND%" && php artisan serve --host=127.0.0.1 --port=8000"

timeout /t 2 /nobreak >nul

echo   Starting React frontend   (http://localhost:5678) ...
start "IU Events -- React Frontend" cmd /k "title IU Events -- React Frontend && cd /d "%FRONTEND%" && npm run dev:csr"

timeout /t 3 /nobreak >nul

:: ============================================================
:: DONE
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
echo     - "IU Events -- Laravel Backend"
echo     - "IU Events -- React Frontend"
echo.
echo   Keep both windows open while using the application.
echo   Close those windows to stop the servers.
echo.
echo  ====================================================
echo.
pause
exit /b 0
