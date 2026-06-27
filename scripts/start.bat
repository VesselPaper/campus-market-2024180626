@echo off
echo ============================================
echo    校园轻集市 - 一键启动
echo ============================================
echo.

echo [1/2] 启动 Mock API 服务 (JSON Server)...
start "JSON Server" cmd /c "npx json-server --watch db.json --port 3000"
echo JSON Server 启动中: http://localhost:3000
echo.

timeout /t 3 /nobreak >nul

echo [2/2] 启动前端开发服务器 (Vite)...
start "Vite" cmd /c "npx vite --port 5173 --host"
echo Vite 启动中: http://localhost:5173
echo.

echo ============================================
echo 两个服务均已启动！
echo 前端页面: http://localhost:5173
echo Mock API: http://localhost:3000
echo ============================================
pause
