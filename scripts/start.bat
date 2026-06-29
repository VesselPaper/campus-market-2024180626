@echo off
chcp 65001 >nul

set PROJECT_DIR=%~dp0..
cd /d "%PROJECT_DIR%"

start "JSON Server" cmd /c "npm run mock"

timeout /t 3 /nobreak >nul

start "Vite" cmd /c "npm run dev"

timeout /t 4 /nobreak >nul

start http://localhost:5173

pause
