const fs = require('fs');
const path = require('path');

function walk(dir) {
  let list = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) list = list.concat(walk(full));
    else if (f.endsWith('.jsx') || f.endsWith('.js')) list.push(full);
  });
  return list;
}

const files = walk('client/src');
const terms = ['उदा.', 'RAMESH', 'SURESH', 'हरदोई', '241001', 'बिलग्राम', 'कछौना', 'सवायजपुर', 'रामपुर', '9876543210', '9999999999', '98XXXXXXXX'];
let found = [];

files.forEach(file => {
  const c = fs.readFileSync(file, 'utf8');
  c.split('\n').forEach((line, idx) => {
    terms.forEach(t => {
      if (line.includes(t)) {
        found.push({ file, line: idx+1, term: t, text: line.trim() });
      }
    });
  });
});

console.log('Total found in client/src:', found.length);
found.forEach(item => {
  console.log(`[${item.term}] ${item.file}:${item.line} -> ${item.text}`);
});
