@echo off
:: 设置中文编码，防止控制台乱码
chcp 65001 >nul
title SkillVault - 启动器

echo ==================================================
echo        SkillVault - 一键启动器
echo ==================================================
echo.

:: 检查是否安装了 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未在系统中检测到 Node.js，请先安装 Node.js!
    echo 请访问 https://nodejs.org 下载并安装 LTS 版本。
    echo.
    pause
    exit /b
)

:: 检查并自动安装项目依赖
if not exist "node_modules\" (
    echo [状态] 检测到首次运行，正在自动安装项目依赖依赖，请稍等...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败，请检查网络连接或尝试手动运行 'npm install'。
        echo.
        pause
        exit /b
      )
      echo [成功] 依赖安装完成！
      echo.
)

echo [状态] 正在启动前后端服务...
echo [提示] 启动成功后，浏览器会自动打开前端页面 (http://localhost:5173)。
echo [提示] 如果想要结束运行，请直接关闭当前窗口，或者在窗口内按 Ctrl+C。
echo.
echo ==================================================
echo.

:: 启动并发开发服务
call npm run dev

pause
