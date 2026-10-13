const fs = require('fs');
const path = require('path');

function walk(dir, list = []) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full, list);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      list.push(full);
    }
  });
  return list;
}

const files = walk('client/src');
console.log('Scanning ' + files.length + ' files...');

const suspicious = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((l, idx) => {
    // 1. Check for fallback to strings with dummy patterns
    const m = l.match(/\|\|\s*(['"][^'"]+['"])/);
    if (m) {
      const val = m[1].replace(/['"]/g, '').trim();
      if (val && !['-', '', '0', 'true', 'false', 'light', 'dark', 'home', 'tool', 'all', 'customer', 'admin', 'superadmin', 'GLOBAL', 'none'].includes(val)) {
        // Check if val looks like a dummy persona or address or phone or specific number
        if (/हरदोई|लखनऊ|रामपुर|बिलग्राम|कछौना|सुरेश|महेश|राजेश|रमेश|कुमार|सिंह|कन्हैया|9876543210|9999999999|1234|241001|48,000|215487965412|UP32|मकान|तहसील/.test(val)) {
          suspicious.push({ file: f, line: idx + 1, text: l.trim(), reason: 'DUMMY_FALLBACK: ' + val });
        }
      }
    }

    // 2. Check for hardcoded persona names in JSX tags
    if (/<[^>]+>.*?(सुरेश|महेश|राजेश|रमेश|कन्हैया|बलदेव|अंशिका|मंगली|कलावती|सुशील|आशा देवी|अमनदीप|दीपक|संजय|अभिषेक|भगवान|रामेश्वर|हरिओम).*?<\/[^>]+>/.test(l)) {
      suspicious.push({ file: f, line: idx + 1, text: l.trim(), reason: 'HARDCODED_PERSONA_JSX' });
    }

    // 3. Check for fake phone numbers
    if (/9876543210|9999999999/.test(l)) {
      suspicious.push({ file: f, line: idx + 1, text: l.trim(), reason: 'FAKE_PHONE' });
    }

    // 4. Check for dummy addresses
    if (/हरदोई|241001|बिलग्राम|कछौना/.test(l)) {
      // ignore if it's just a general district list in e-district if applicable, but flag to inspect
      suspicious.push({ file: f, line: idx + 1, text: l.trim(), reason: 'HARDOI_OR_LOCAL_ADDRESS' });
    }
  });
});

console.log('Total suspicious items found: ' + suspicious.length);
suspicious.forEach(s => {
  console.log(`[${s.reason}] ${s.file}:${s.line} -> ${s.text}`);
});
