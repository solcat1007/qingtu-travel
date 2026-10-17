@echo off
chcp 65001 >nul
title 旅游网站 - GPU Accelerated
echo ============================================
echo   GPU Accelerated Server
echo   Node.js + Express + SQLite
echo   http://localhost:3000
echo ============================================
echo.

REM GPU acceleration flags for Node.js
set NODE_OPTIONS=--max-old-space-size=4096

REM Chromium GPU flags (for future Puppeteer use)
set CHROMIUM_FLAGS=--enable-gpu --gpu-rasterization --enable-zero-copy --disable-gpu-driver-bug-workarounds

cd /d "G:\旅游网站项目\网站源码"

echo Starting server with GPU acceleration...
node server.js

pause
