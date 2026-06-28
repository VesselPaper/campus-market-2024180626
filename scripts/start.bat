@echo off
chcp 65001 >nul

echo ============================================
echo     Campus Light Market - Quick Start
echo ============================================
echo.

:: Get the project root directory (parent of scripts/)
set PROJECT_DIR=%~dp0..
cd /d "%PROJECT_DIR%"

echo [1/3] Starting JSON Server (Mock API)...
echo       Port: 3000
start "JSON Server" cmd /c "npx json-server --watch db.json --port 3000"

:: Wait for JSON Server to initialize
timeout /t 3 /nobreak >nul

echo [2/3] Starting Vite dev server...
echo       Port: 5173
start "Vite" cmd /c "npx vite --port 5173 --host"

:: Wait for Vite to start
timeout /t 4 /nobreak >nul

echo [3/3] Opening browser...
start http://localhost:5173

echo.
echo ============================================
echo  All services are running!
echo.
echo  Frontend:  http://localhost:5173
echo  Mock API:  http://localhost:3000/items
echo.
echo  Press any key to close this window.
echo  (Services will continue running)
echo ============================================
echo.
pause
