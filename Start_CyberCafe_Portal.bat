@echo off
title Smart Cyber Cafe Portal
chcp 65001 > nul
echo ========================================================
echo   🚀 स्मार्ट साइबर कैफे एवं जन सेवा केंद्र पोर्टल
echo ========================================================
cd /d "C:\Users\hp\.gemini\antigravity\scratch\cybercafe-portal"

echo.
echo [1/2] सर्वर शुरू किया जा रहा है...
start "CyberCafeServer" /b node server/server.js

timeout /t 2 /nobreak > nul

echo.
echo [2/2] ब्राउज़र खोला जा रहा है...
start http://localhost:5000

echo.
echo ========================================================
echo   ✅ पोर्टल सफलतापूर्वक शुरू हो गया है!
echo   👉 आपके PC पर: http://localhost:5000
echo   👉 दुकान Wi-Fi पर: http://192.168.1.2:5000
echo ========================================================
echo (इस विंडो को बंद कर सकते हैं)
pause
