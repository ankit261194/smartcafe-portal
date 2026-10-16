const fs = require('fs');

const disc = JSON.parse(fs.readFileSync('all_endpoints_discovered.json', 'utf8'));
const endpoints = new Set();
disc.forEach(d => {
  (d.endpoints || []).forEach(e => {
    (e.strMatches || []).forEach(m => {
      const clean = m.replace(/["']/g, '').trim();
      if (clean.includes('/api/') || clean.includes('/serviceApi/')) {
        endpoints.add(clean);
      }
    });
  });
});

console.log('Unique API endpoints found in legacy files:', endpoints.size);
const sorted = Array.from(endpoints).sort();
sorted.forEach(e => console.log(e));
