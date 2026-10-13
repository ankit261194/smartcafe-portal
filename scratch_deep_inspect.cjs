const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.php')) {
      results.push(full);
    }
  });
  return results;
}

const targetDirs = ['client/src', 'server', 'client/public/api'];
let files = [];
targetDirs.forEach(d => {
  files = files.concat(walk(d));
});

console.log('Total source files to scan:', files.length);

const mockTerms = [
  'सुरेश', 'रमेश', 'महेश', 'राजेश', 'पूजा', 'रोहित', 'अमित', 'सुनीता', 'कन्हैया', 'बलदेव',
  '9876543210', '9999999999', '98XXXXXXXX',
  '241001', 'हरदोई', 'बिलग्राम', 'कछौना', 'सवायजपुर', 'रामपुर', 'सांडी', 'बेहटा',
  'उदा.'
];

let hits = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    mockTerms.forEach(term => {
      if (line.includes(term)) {
        hits.push({ file: f, line: idx + 1, term, snippet: line.trim() });
      }
    });
  });
});

console.log('Total hits found:', hits.length);
hits.forEach(h => {
  console.log(`[${h.term}] ${h.file}:${h.line} -> ${h.snippet}`);
});
