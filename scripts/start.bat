@echo off
chcp 65001 >nul


set PROJECT_DIR=%~dp0..
cd /d "%PROJECT_DIR%"

start "JSON Server" cmd /c "npx json-server --watch db.json --port 3000"

timeout /t 3 /nobreak >nul

start "Vite" cmd /c "npx vite --port 5173 --host"

timeout /t 4 /nobreak >nul

start http://localhost:5173

pause
