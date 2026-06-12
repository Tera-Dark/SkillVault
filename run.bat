@echo off
:: Force switch current workspace to script directory
cd /d "%~dp0"
:: Set active code page to UTF-8
chcp 65001 >nul
title SkillVault - Launcher

echo ==================================================
echo        SkillVault - Service Launcher
echo ==================================================
echo.

:: Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b
)

:: Check and auto install dependencies
if not exist "node_modules" (
    echo [STATUS] First run detected. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies. Please run 'npm install' manually.
        echo.
        pause
        exit /b
    )
    echo [SUCCESS] Dependencies installed successfully!
    echo.
)

echo [STATUS] Starting client and server services...
echo [TIPS] Browser will automatically open: http://localhost:5173
echo [TIPS] To stop services, close this window or press Ctrl+C.
echo.
echo ==================================================
echo.

:: Start concurrent services
call npm run dev

pause
