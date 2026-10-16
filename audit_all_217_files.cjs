const fs = require('fs');
const path = require('path');

const membersDir = 'C:\\Users\\hp\\Downloads\\p4points\\p4points\\members';
const files = fs.readdirSync(membersDir).filter(f => f.endsWith('.php'));

const results = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(membersDir, file), 'utf8');
  
  // Extract all lines that look like API calls, URLs, or endpoint construction
  const lines = content.split('\n');
  const apiLines = [];
  const formFields = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (
      l.includes('http://') ||
      l.includes('https://') ||
      l.includes('TargetApi') ||
      l.includes('p4points') ||
      l.includes('/api/') ||
      l.includes('/serviceApi/') ||
      l.includes('curl_init') ||
      l.includes('curl_setopt') ||
      l.includes('curlPost') ||
      l.includes('curlGet') ||
      l.includes('file_get_contents') ||
      l.includes('$.ajax') ||
      l.includes('$.post') ||
      l.includes('$.get')
    ) {
      apiLines.push({ line: i + 1, text: l });
    }

    const matches = l.matchAll(/\$_(POST|GET|REQUEST)\[['"]([^'"]+)['"]\]/g);
    for (const m of matches) {
      formFields.add(m[2]);
    }
  }

  if (apiLines.length > 0 || formFields.size > 0) {
    results[file] = {
      apiLines: apiLines.slice(0, 20),
      formFields: Array.from(formFields)
    };
  }
}

fs.writeFileSync('all_217_analysis.json', JSON.stringify(results, null, 2));
console.log('Analyzed all 217 files. Files with API or form handling:', Object.keys(results).length);
