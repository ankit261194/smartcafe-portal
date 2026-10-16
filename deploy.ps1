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

Write-Host "[2/5] Synchronizing Production Assets, Live Database & PHP API (Preserving User Accounts)..." -ForegroundColor Cyan
try {
  $liveStats = Invoke-RestMethod -Uri "https://smartcafe.sbs/api/index.php?endpoint=superadmin/live-vault" -Headers @{"Authorization"="Bearer Aa@910010025123343"} -TimeoutSec 15 -ErrorAction SilentlyContinue
  if (-not $liveStats) {
    $liveStats = Invoke-RestMethod -Uri "https://smartcafe.sbs/api/index.php?endpoint=superadmin/stats" -Headers @{"Authorization"="Bearer Aa@910010025123343"} -TimeoutSec 15 -ErrorAction SilentlyContinue
  }
  if ($liveStats) {
    $liveStats | ConvertTo-Json -Depth 6 | Out-File -FilePath "$PSScriptRoot\server\data\live_sync_temp.json" -Encoding utf8
    Write-Host "  -> Successfully fetched live Hostinger database sync ($($liveStats.users.Count) Users, $($liveStats.cafes.Count) Cafes, $($liveStats.utrRequests.Count) UTRs)" -ForegroundColor Green
  }
} catch {
  Write-Host "  -> Live fetch notice: $($_.Exception.Message) (Continuing with local vault)" -ForegroundColor DarkGray
}

node -e "
const fs = require('fs');
const p1 = 'server/data/store.json';
const p2 = 'client/public/api/data/store.json';
const p3 = 'client/dist/api/data/store.json';
function readJsonSafe(p) {
  if (!fs.existsSync(p)) return {};
  try {
    const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').trim();
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}
let s1 = readJsonSafe(p1);
let s2 = readJsonSafe(p2);
let s3 = readJsonSafe(p3);

let liveSync = {};
if (fs.existsSync('server/data/live_sync_temp.json')) {
  try {
    const raw = fs.readFileSync('server/data/live_sync_temp.json', 'utf8').replace(/^\uFEFF/, '').trim();
    liveSync = JSON.parse(raw);
  } catch (e) { console.error('liveSync parse error:', e.message); }
}

const mPath = 'server/data/users_master.json';
let masterUsers = fs.existsSync(mPath) ? (readJsonSafe(mPath) || []) : [];
if (!Array.isArray(masterUsers)) masterUsers = [];

// 1. Populate local accounts first (lowest priority)
const allUsersMap = new Map();
[...masterUsers, ...(s1.users||[]), ...(s2.users||[]), ...(s3.users||[])].forEach(u => {
  if (u && u.phone) allUsersMap.set(u.phone, u);
});

// 2. OVERLAY LIVE HOSTINGER USERS (LIVE TAKES HIGHEST PRIORITY - NEVER OVERWRITTEN BY LOCAL DATA!)
(liveSync.users || []).forEach(u => {
  if (u && u.phone) {
    if (allUsersMap.has(u.phone)) {
      const existing = allUsersMap.get(u.phone);
      const merged = Object.assign({}, existing, u);
      if (u.password && u.password.trim()) {
        merged.password = u.password;
      }
      allUsersMap.set(u.phone, merged);
    } else {
      allUsersMap.set(u.phone, u);
    }
  }
});
const mergedUsers = Array.from(allUsersMap.values());
s1.users = mergedUsers;
s2.users = mergedUsers;
s3.users = mergedUsers;

// Protect Registered Cafes
const allCafesMap = new Map();
[...(s1.cafes||[]), ...(s2.cafes||[]), ...(s3.cafes||[])].forEach(c => {
  if (c && (c.id || c.phone)) allCafesMap.set(c.phone || c.id, c);
});
(liveSync.cafes || []).forEach(c => {
  if (c && (c.id || c.phone)) {
    allCafesMap.set(c.phone || c.id, c);
  }
});
const mergedCafes = Array.from(allCafesMap.values());
s1.cafes = mergedCafes;
s2.cafes = mergedCafes;
s3.cafes = mergedCafes;

// Protect wallets
const allWalletsMap = new Map();
[...(s1.wallets||[]), ...(s2.wallets||[]), ...(s3.wallets||[])].forEach(w => {
  if (w && w.phone) allWalletsMap.set(w.phone, w);
});
(liveSync.wallets || []).forEach(w => {
  if (w && w.phone) allWalletsMap.set(w.phone, w);
});
mergedUsers.forEach(u => {
  if (u && u.phone) {
    if (!allWalletsMap.has(u.phone)) {
      allWalletsMap.set(u.phone, {
        phone: u.phone,
        customerName: u.name || 'ग्राहक',
        balance: (u.balance !== undefined ? u.balance : 0),
        transactions: []
      });
    } else {
      const existing = allWalletsMap.get(u.phone);
      if (existing) {
        if (u.balance !== undefined && u.balance === 0) {
          existing.balance = 0;
        }
        if (Array.isArray(existing.transactions)) {
          existing.transactions = existing.transactions.filter(t => t.id !== 'TXN-INIT-500' && t.description !== 'Opening Balance');
        }
      }
    }
  }
});
const mergedWallets = Array.from(allWalletsMap.values());
s1.wallets = mergedWallets;
s2.wallets = mergedWallets;
s3.wallets = mergedWallets;

// Protect UTR requests (Merging live pending and past requests)
const allUtrsMap = new Map();
[...(s1.utrRequests||[]), ...(s2.utrRequests||[]), ...(s3.utrRequests||[])].forEach(u => {
  if (u && u.id) allUtrsMap.set(u.id, u);
});
(liveSync.utrRequests || []).forEach(u => {
  if (u && u.id) allUtrsMap.set(u.id, u);
});
const mergedUtrs = Array.from(allUtrsMap.values());
s1.utrRequests = mergedUtrs;
s2.utrRequests = mergedUtrs;
s3.utrRequests = mergedUtrs;

fs.mkdirSync('client/dist/api/data', { recursive: true });
fs.writeFileSync(p1, JSON.stringify(s1, null, 2));
fs.writeFileSync(p2, JSON.stringify(s2, null, 2));
fs.writeFileSync(p3, JSON.stringify(s3, null, 2));
fs.writeFileSync('server/data/users_master.json', JSON.stringify(mergedUsers, null, 2));
fs.writeFileSync('client/public/api/data/users_master.json', JSON.stringify(mergedUsers, null, 2));
fs.writeFileSync('client/dist/api/data/users_master.json', JSON.stringify(mergedUsers, null, 2));
console.log('Account Protection: Merged and preserved ' + mergedUsers.length + ' accounts, ' + mergedCafes.length + ' cafes, ' + mergedWallets.length + ' wallets, & ' + mergedUtrs.length + ' UTRs.');
"
Copy-Item -Path "$PSScriptRoot\client\public\.htaccess" -Destination "$PSScriptRoot\client\dist\.htaccess" -Force
if (-not (Test-Path "$PSScriptRoot\client\dist\api")) {
    New-Item -ItemType Directory -Path "$PSScriptRoot\client\dist\api" -Force
}
Copy-Item -Path "$PSScriptRoot\client\public\api\index.php" -Destination "$PSScriptRoot\client\dist\api\index.php" -Force
Copy-Item -Path "$PSScriptRoot\client\public\api\db.php" -Destination "$PSScriptRoot\client\dist\api\db.php" -Force
Copy-Item -Path "$PSScriptRoot\client\public\api\db-config.sample.php" -Destination "$PSScriptRoot\client\dist\api\db-config.sample.php" -Force
if (-not (Test-Path "$PSScriptRoot\client\dist\api\data")) {
    New-Item -ItemType Directory -Path "$PSScriptRoot\client\dist\api\data" -Force
}
# Immutable Schema & User Vault Files ONLY - NEVER overwrite live store.json
Copy-Item -Path "$PSScriptRoot\client\public\api\data\services_79.json" -Destination "$PSScriptRoot\client\dist\api\data\services_79.json" -Force
Copy-Item -Path "$PSScriptRoot\client\public\api\data\users_master.json" -Destination "$PSScriptRoot\client\dist\api\data\users_master.json" -Force
if (-not (Test-Path "$PSScriptRoot\client\dist\api\data\store.json")) {
    Copy-Item -Path "$PSScriptRoot\client\public\api\data\store.json" -Destination "$PSScriptRoot\client\dist\api\data\store.json" -Force
}
if (Test-Path "$PSScriptRoot\client\public\CyberCafe_Portal.apk") {
    Copy-Item -Path "$PSScriptRoot\client\public\CyberCafe_Portal.apk" -Destination "$PSScriptRoot\client\dist\CyberCafe_Portal.apk" -Force
}
Copy-Item -Path "$PSScriptRoot\client\public\robots.txt" -Destination "$PSScriptRoot\client\dist\robots.txt" -Force
Copy-Item -Path "$PSScriptRoot\client\public\sitemap.xml" -Destination "$PSScriptRoot\client\dist\sitemap.xml" -Force
if (Test-Path "$PSScriptRoot\client\public\services") {
    if (-not (Test-Path "$PSScriptRoot\client\dist\services")) {
        New-Item -ItemType Directory -Path "$PSScriptRoot\client\dist\services" -Force
    }
    Copy-Item -Path "$PSScriptRoot\client\public\services\*" -Destination "$PSScriptRoot\client\dist\services" -Recurse -Force
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
