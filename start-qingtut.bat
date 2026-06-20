@echo off
chcp 65001 >nul
title 晴途 - GPU Accelerated Travel
echo ======================================
echo    晴途 GPU加速服务器
echo    http://localhost:3000
echo ======================================
echo.

REM GPU 加速：扩大内存 + 启用 V8 优化
set NODE_OPTIONS=--max-old-space-size=4096 --jitless

REM Chromium/WebGL 加速标志（未来 Puppeteer 使用）
set CHROMIUM_FLAGS=--enable-gpu --enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --disable-gpu-driver-bug-workarounds

cd /d "G:\旅游网站项目\网站源码"
echo [GPU] NODE_OPTIONS: %NODE_OPTIONS%
echo [GPU] Starting Node.js with GPU acceleration...
node server.js
pause
