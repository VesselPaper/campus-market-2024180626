@cd /d "%~dp0.."
@start "json-server" cmd /c "npm run mock"
@timeout /t 2 >nul
@start "vite" cmd /c "npm run dev"
@timeout /t 3 >nul
@start http://localhost:5173