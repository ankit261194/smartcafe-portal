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
console.log('Total files scanned:', files.length);

const findings = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check for placeholders
    const pMatch = line.match(/placeholder=["']([^"']+)["']/);
    if (pMatch) {
      const text = pMatch[1];
      if (/उदा|नमूना|उदाहरण|sample|UP32|ABCDE|1234|राजेश|रमेश|हरिओम|रामेश्वर|महेश|कुमार|सिंह|शर्मा|वर्मा/i.test(text)) {
        findings.push({ file: f, line: idx + 1, type: 'PLACEHOLDER', text: text.trim() });
      }
    }

    // Check for hardcoded fallbacks
    const fMatch = line.match(/\|\|\s*['"]([^'"]{3,})['"]/);
    if (fMatch) {
      const val = fMatch[1];
      if (/राजेश|रमेश|हरिओम|रामेश्वर|महेश|कुमार|सिंह|शर्मा|वर्मा|UP32|1990|हरदोई|सदर/i.test(val)) {
        findings.push({ file: f, line: idx + 1, type: 'FALLBACK', text: val.trim() });
      }
    }

    // Check for useState initial values with dummy strings
    const sMatch = line.match(/useState\(\s*['"]([^'"]{3,})['"]\s*\)/);
    if (sMatch) {
      const val = sMatch[1];
      if (/राजेश|रमेश|हरिओम|रामेश्वर|महेश|कुमार|सिंह|शर्मा|वर्मा|UP32|ABCDE|1990|हरदोई|सदर/i.test(val)) {
        findings.push({ file: f, line: idx + 1, type: 'STATE_INIT', text: val.trim() });
      }
    }
  });
});

console.log('Found ' + findings.length + ' potential dummy data points:');
findings.forEach(item => {
  console.log(`[${item.type}] ${item.file}:${item.line} -> ${item.text}`);
});
