const fs = require('fs');

let s = fs.readFileSync('client/src/components/ServicePage.jsx', 'utf8');

// 1. Remove line 398 setShowBalanceGateModal(true);
s = s.replace(
  `      if (res.status === 403) {
        setErrorMsg(data.error || \`अपर्याप्त बैलेंस! इस सेवा के लिए ₹\${requiredFee} आवश्यक है। कृपया पहले वॉलेट रिचार्ज करें।\`);
        setShowBalanceGateModal(true);
        setLoading(false);
        return;
      }`,
  `      if (res.status === 403) {
        setErrorMsg(data.error || \`अपर्याप्त बैलेंस! इस सेवा के लिए ₹\${requiredFee} आवश्यक है। कृपया पहले वॉलेट रिचार्ज करें।\`);
        setLoading(false);
        return;
      }`
);

// 2. Enhance inline errorMsg display with a direct 1-click Recharge button
const oldErrorDisplay = `              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}`;

const newErrorDisplay = `              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold space-y-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                  {errorMsg.includes('बैलेंस') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isOperator && onOpenB2bWallet) onOpenB2bWallet();
                        else if (onOpenWallet) onOpenWallet();
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition transform active:scale-95 text-xs"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>⚡ तुरंत वॉलेट रिचार्ज करें (Instant Top-up)</span>
                    </button>
                  )}
                </div>
              )}`;

if (s.includes(oldErrorDisplay)) {
  s = s.replace(oldErrorDisplay, newErrorDisplay);
}

// 3. Remove Insufficient Balance Gate Modal (Zero Credit Policy) markup
const modalRegex = /\{\/\* Insufficient Balance Gate Modal \(Zero Credit Policy\) \*\/\}[\s\S]*?\{showBalanceGateModal && \([\s\S]*?<\/div>\s*\)\}/;
s = s.replace(modalRegex, '');

fs.writeFileSync('client/src/components/ServicePage.jsx', s, 'utf8');
console.log('client/src/components/ServicePage.jsx patched cleanly!');
