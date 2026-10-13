# ==============================================================================
# SMART CAFE B2B - 1-CLICK AUTONOMOUS CLOUD DEPLOYMENT SCRIPT
# ==============================================================================
# Usage: Run in PowerShell: .\deploy.ps1
# Automatically compiles React, syncs PHP API, and pushes to GitHub (main and deploy)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "[1/5] Building Frontend Production Bundle..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\client"
npm run build
Set-Location -Path "$PSScriptRoot"

Write-Host "[2/5] Synchronizing Production Assets and PHP API..." -ForegroundColor Cyan
Copy-Item -Path "$PSScriptRoot\client\public\.htaccess" -Destination "$PSScriptRoot\client\dist\.htaccess" -Force
if (-not (Test-Path "$PSScriptRoot\client\dist\api")) {
    New-Item -ItemType Directory -Path "$PSScriptRoot\client\dist\api" -Force
}
Copy-Item -Path "$PSScriptRoot\client\public\api\index.php" -Destination "$PSScriptRoot\client\dist\api\index.php" -Force
if (Test-Path "$PSScriptRoot\client\public\CyberCafe_Portal.apk") {
    Copy-Item -Path "$PSScriptRoot\client\public\CyberCafe_Portal.apk" -Destination "$PSScriptRoot\client\dist\CyberCafe_Portal.apk" -Force
}

$nowStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "[3/5] Pushing Live Build to GitHub (branch: deploy)..." -ForegroundColor Cyan
git -C "$PSScriptRoot\client\dist" add -A
$distStatus = git -C "$PSScriptRoot\client\dist" status --porcelain
if ($distStatus) {
    git -C "$PSScriptRoot\client\dist" commit -m "deploy: live build $nowStr"
}
git -C "$PSScriptRoot\client\dist" push origin deploy

Write-Host "[4/5] Pushing Source Code to GitHub (branch: main)..." -ForegroundColor Cyan
git add .
$srcStatus = git status --porcelain
if ($srcStatus) {
    git commit -m "feat: updates $nowStr"
}
git push origin main

Write-Host "[5/5] Packaging Local Backup ZIP (Downloads)..." -ForegroundColor Cyan
tar -C "$PSScriptRoot\client\dist" -a -cf "$PSScriptRoot\public_html.zip" .
Copy-Item -Path "$PSScriptRoot\public_html.zip" -Destination "$HOME\Downloads\public_html.zip" -Force
if (Test-Path "$HOME\Desktop") {
    Copy-Item -Path "$PSScriptRoot\public_html.zip" -Destination "$HOME\Desktop\public_html.zip" -Force
}

Write-Host "================================================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE! All updates are live on GitHub!" -ForegroundColor Green
Write-Host "GitHub Repo: https://github.com/ankit261194/smartcafe-portal" -ForegroundColor Yellow
Write-Host "Deploy Branch: https://github.com/ankit261194/smartcafe-portal/tree/deploy" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Green
