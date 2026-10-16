const fs = require('fs');

const s79 = JSON.parse(fs.readFileSync('server/data/services_79.json', 'utf8'));
const legacy = JSON.parse(fs.readFileSync('full_member_scripts_audit.json', 'utf8'));
const docs = JSON.parse(fs.readFileSync('server/data/p4points_docs.json', 'utf8'));

console.log('Total services in 79 catalog:', s79.length);

const matchedReport = [];

for (const svc of s79) {
  // Find matching legacy scripts
  const svcId = svc.id.toLowerCase();
  const svcName = svc.name.toLowerCase();
  const cat = svc.category.toLowerCase();

  const matchingScripts = legacy.filter(leg => {
    const f = leg.file.toLowerCase().replace(/[-_]/g, '');
    const cleanId = svcId.replace(/[-_]/g, '');
    return f.includes(cleanId) || cleanId.includes(f.replace('.php', ''));
  });

  // Also match by category or keywords
  let bestScript = matchingScripts[0] || null;

  matchedReport.push({
    id: svc.id,
    name: svc.name,
    category: svc.category,
    currentEndpoint: svc.apiEndpoint,
    currentMethod: svc.method,
    currentStatus: svc.status,
    matchedLegacyFiles: matchingScripts.map(m => m.file)
  });
}

fs.writeFileSync('cross_audit_initial.json', JSON.stringify(matchedReport, null, 2));
console.log('Saved cross audit initial');
