@echo off
chcp 65001 >nul

set PROJECT_DIR=%~dp0..
cd /d "%PROJECT_DIR%"

echo [校园轻集市] 正在启动 JSON Server...
start "JSON Server" cmd /c "npm run mock"

echo 等待 JSON Server 启动...
timeout /t 3 /nobreak >nul

echo [校园轻集市] 正在启动 Vite 开发服务器...
start "Vite" cmd /c "npm run dev"

echo 等待 Vite 启动...
timeout /t 4 /nobreak >nul

echo [校园轻集市] 正在打开浏览器...
start http://localhost:5173

echo.
echo 如果浏览器无法访问，请检查控制台输出的实际端口号。
echo 关闭此窗口将停止所有服务。
echo.
pause
