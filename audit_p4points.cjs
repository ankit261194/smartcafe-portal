const fs = require('fs');
const path = require('path');

const membersDir = 'C:\\Users\\hp\\Downloads\\p4points\\p4points\\members';
const files = fs.readdirSync(membersDir).filter(f => f.endsWith('.php'));

console.log('Total PHP files in members:', files.length);

const results = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(membersDir, file), 'utf8');
  
  // Find curl URLs or string URLs containing authorized.p4points.co.in or api
  const urlRegex = /https?:\/\/[a-zA-Z0-9.\-_/:]+authorized\.p4points\.co\.in[^\s"'>\)]*/gi;
  const matches = content.match(urlRegex) || [];
  
  // Also check other URLs if any
  const anyUrlRegex = /https?:\/\/[^\s"'>\)]+\.php[^\s"'>\)]*/gi;
  const anyMatches = content.match(anyUrlRegex) || [];
  
  // Combine matches
  const combined = Array.from(new Set([...matches, ...anyMatches]));
  
  if (combined.length > 0) {
    results.push({
      file,
      urls: combined
    });
  }
}

console.log('Files with URLs:', results.length);
fs.writeFileSync('audit_p4_results.json', JSON.stringify(results, null, 2));
console.log('Saved to audit_p4_results.json');
