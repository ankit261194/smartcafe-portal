const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\hp\\Downloads\\p4points\\p4points\\config\\function.php', 'utf8');
const lines = content.split('\n');

const apiFunctions = [];
let currentFunc = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const funcMatch = line.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
  if (funcMatch) {
    if (currentFunc) {
      apiFunctions.push(currentFunc);
    }
    currentFunc = {
      name: funcMatch[1],
      line: i + 1,
      lines: [line]
    };
  } else if (currentFunc) {
    currentFunc.lines.push(line);
    if (currentFunc.lines.length > 50) {
      // keep reasonable
    }
  }
}
if (currentFunc) apiFunctions.push(currentFunc);

// Filter functions with TargetApi or /api/
const filtered = apiFunctions.filter(f => 
  f.lines.some(l => l.includes('TargetApi') || l.includes('/api/') || l.includes('curl'))
);

console.log('Total API functions in function.php:', filtered.length);

filtered.forEach(f => {
  console.log(`\n=== Function: ${f.name} (Line ${f.line}) ===`);
  f.lines.forEach(l => {
    if (l.includes('url') || l.includes('TargetApi') || l.includes('/api/') || l.includes('curl_init') || l.includes('http_build_query')) {
      console.log('   ' + l.trim());
    }
  });
});
