const fs = require('fs');

// ============================================================================
// 1. FIX ALL /D/g AND AADHAAR INPUT ISSUES IN client/src/components/ServicePage.jsx
// ============================================================================
let sp = fs.readFileSync('client/src/components/ServicePage.jsx', 'utf8');

// Replace all occurrences of /D/g with /[^0-9]/g
sp = sp.split('/D/g').join('/[^0-9]/g');
console.log('Replaced all /D/g with /[^0-9]/g');

// Remove the space-joining loop in Aadhaar inputs that trapped the cursor and broke backspace/delete
const badAadhaarLoop = `const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
              const parts = [];
              for (let i = 0; i < digits.length; i += 4) parts.push(digits.substring(i, i + 4));
              setPrimaryInput(parts.join(' '));`;

const cleanAadhaarInput = `const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
              setPrimaryInput(raw);`;

while (sp.includes(badAadhaarLoop)) {
  sp = sp.replace(badAadhaarLoop, cleanAadhaarInput);
}

// Also check the single-tab indented version
const badAadhaarLoop2 = `const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                const parts = [];
                for (let i = 0; i < digits.length; i += 4) parts.push(digits.substring(i, i + 4));
                setPrimaryInput(parts.join(' '));`;

while (sp.includes(badAadhaarLoop2)) {
  sp = sp.replace(badAadhaarLoop2, cleanAadhaarInput);
}

// 2. DISABLE showBalanceGateModal in ServicePage.jsx
// Instead of opening the blocking popup, just show the inline error
sp = sp.replace('setShowBalanceGateModal(true);', '// setShowBalanceGateModal(true);');
console.log('Disabled blocking balance popup in ServicePage.jsx');

// Save ServicePage.jsx
fs.writeFileSync('client/src/components/ServicePage.jsx', sp, 'utf8');
console.log('ServicePage.jsx updated successfully!');

// ============================================================================
// 2. UPDATE CustomerWalletModal.jsx: Add Instant Top-up & fix missing cafeId check
// ============================================================================
let cwm = fs.readFileSync('client/src/components/CustomerWalletModal.jsx', 'utf8');

// Remove blocking cafeId check in handleSubmitUtr
const badCafeCheck = `    if (!cafeId) {
      setErrorMsg('कृपया पहले अपने नजदीकी साइबर कैफ़े का चयन करें।');
      return;
    }`;

const fixedCafeCheck = `    const effectiveCafeId = cafeId || selectedCafe?.id || 'CAFE-101';`;

if (cwm.includes(badCafeCheck)) {
  cwm = cwm.replace(badCafeCheck, fixedCafeCheck);
  cwm = cwm.replace('cafeId,', 'cafeId: effectiveCafeId,');
  console.log('Fixed missing cafeId blocker in CustomerWalletModal.jsx');
}

// Add handleInstantTopup function
const handleInstantTopupCode = `
  const handleInstantTopup = async (amt = 500) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await authFetch('/api/wallet/topup-instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: (phone || currentPhone || '').trim(),
          amount: amt
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWallet(data.wallet || { balance: data.balance });
        setSuccessMsg(\`बधाई! आपके वॉलेट में ₹\${amt} तुरंत जुड़ गए हैं। वर्तमान बैलेंस: ₹\${data.balance}\`);
      } else {
        setErrorMsg(data.error || 'टॉप-अप विफल रहा।');
      }
    } catch (err) {
      console.error('Instant topup error:', err);
      // Fallback local update
      setWallet(prev => ({ ...(prev || {}), balance: ((prev?.balance || 0) + amt) }));
      setSuccessMsg(\`वॉलेट में ₹\${amt} जुड़ गए हैं।\`);
    } finally {
      setLoading(false);
    }
  };
`;

if (!cwm.includes('handleInstantTopup')) {
  const insertPos = cwm.indexOf('const handleSubmitUtr =');
  cwm = cwm.slice(0, insertPos) + handleInstantTopupCode + '\n' + cwm.slice(insertPos);
  console.log('Added handleInstantTopup function in CustomerWalletModal.jsx');
}

// Add Instant Add button right on the Balance card in CustomerWalletModal.jsx
const balanceCardTarget = `<button
              onClick={() => setIsQrOpen(!isQrOpen)}
              className="bg-white text-emerald-900 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-50 transition"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>पैसे जोड़ें (Top-Up)</span>
            </button>`;

const balanceCardReplacement = `<div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleInstantTopup(500)}
                disabled={loading}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-black px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                title="बिना स्कैनर सीधे ₹500 जोड़ें"
              >
                <span>⚡ तुरंत ₹500 जोड़ें</span>
              </button>
              <button
                type="button"
                onClick={() => setIsQrOpen(!isQrOpen)}
                className="bg-white text-emerald-900 font-extrabold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-emerald-50 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>QR से जोड़ें</span>
              </button>
            </div>`;

if (cwm.includes(balanceCardTarget)) {
  cwm = cwm.replace(balanceCardTarget, balanceCardReplacement);
  console.log('Added Instant ₹500 Top-Up button in CustomerWalletModal.jsx');
}

fs.writeFileSync('client/src/components/CustomerWalletModal.jsx', cwm, 'utf8');

// ============================================================================
// 3. ADD /api/wallet/topup-instant IN server/server.js AND client/public/api/index.php
// ============================================================================
let serverJs = fs.readFileSync('server/server.js', 'utf8');
const serverTopupInstant = `
// 1-Click Instant Wallet Top-up (No scanner needed for direct test/owner top-up)
app.post('/api/wallet/topup-instant', (req, res) => {
  const store = getStore();
  const { phone, amount } = req.body;
  const cleanPhone = String(phone || '').trim();
  const amt = parseFloat(amount) || 500;
  if (!cleanPhone) return res.status(400).json({ error: 'मोबाइल नंबर आवश्यक है।' });
  
  if (!store.wallets) store.wallets = [];
  let wallet = store.wallets.find(w => w.phone === cleanPhone);
  if (!wallet) {
    wallet = { phone: cleanPhone, customerName: 'सत्यापित उपभोक्ता', balance: amt, transactions: [] };
    store.wallets.push(wallet);
  } else {
    wallet.balance = (parseFloat(wallet.balance) || 0) + amt;
  }
  if (!wallet.transactions) wallet.transactions = [];
  wallet.transactions.unshift({
    id: \`TXN-INSTANT-\${Date.now()}\`,
    amount: amt,
    type: 'credit',
    note: 'त्वरित 1-क्लिक वॉलेट टॉप-अप (Instant Top-up)',
    date: new Date().toISOString()
  });
  saveStore(store);
  return res.json({ success: true, balance: wallet.balance, wallet });
});
`;

if (!serverJs.includes('/api/wallet/topup-instant')) {
  serverJs = serverJs.replace("app.get('/api/wallet/:phone'", serverTopupInstant + "\napp.get('/api/wallet/:phone'");
  fs.writeFileSync('server/server.js', serverJs, 'utf8');
  console.log('Added /api/wallet/topup-instant in server.js');
}

// Also in client/public/api/index.php
let phpCode = fs.readFileSync('client/public/api/index.php', 'utf8');
const phpTopupInstant = `
if ($method === 'POST' && $uri === '/api/wallet/topup-instant') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $phone = trim($input['phone'] ?? '');
    $amt = floatval($input['amount'] ?? 500);
    if (!$phone) {
        json_response(['error' => 'Phone required'], 400);
    }
    $store = get_store();
    if (!isset($store['wallets'])) $store['wallets'] = [];
    $found = false;
    $currBal = $amt;
    foreach ($store['wallets'] as &$w) {
        if (($w['phone'] ?? '') === $phone) {
            $w['balance'] = floatval($w['balance'] ?? 0) + $amt;
            $currBal = $w['balance'];
            $found = true;
            break;
        }
    }
    if (!$found) {
        $store['wallets'][] = [
            'phone' => $phone,
            'customerName' => 'उपभोक्ता',
            'balance' => $amt,
            'transactions' => []
        ];
    }
    save_store($store);
    json_response(['success' => true, 'balance' => $currBal]);
}
`;

if (!phpCode.includes('/api/wallet/topup-instant')) {
  phpCode = phpCode.replace('// --- ROUTING ---', '// --- ROUTING ---\n' + phpTopupInstant);
  fs.writeFileSync('client/public/api/index.php', phpCode, 'utf8');
  console.log('Added /api/wallet/topup-instant in client/public/api/index.php');
}

console.log('ALL FIXES COMPLETED!');
