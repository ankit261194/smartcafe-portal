@echo off
title Stop Cyber Cafe Portal
echo ========================================================
echo   🛑 साइबर कैफे पोर्टल बंद किया जा रहा है...
echo ========================================================
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul
echo.
echo ✅ पोर्टल सफलतापूर्वक बंद कर दिया गया है।
timeout /t 2 > nul
