const fs = require('fs');
const path = require('path');

const membersDir = 'C:\\Users\\hp\\Downloads\\p4points\\p4points\\members';
const files = fs.readdirSync(membersDir).filter(f => f.endsWith('.php'));

const detailedMap = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(membersDir, file), 'utf8');
  if (!/curl_exec/i.test(content) && !content.includes('p4points.co.in') && !content.includes('TargetApi')) continue;

  const lines = content.split('\n');
  const urls = [];
  let isPost = /CURLOPT_POST/i.test(content);
  let postFields = [];

  for (const line of lines) {
    // Detect URLs
    const matches = line.match(/https?:\/\/[^\s"'>\)]+/gi);
    if (matches) {
      urls.push(...matches);
    }
    // Detect TargetApi URLs
    if (line.includes('TargetApi("TargetApi_url")') || line.includes("TargetApi('TargetApi_url')")) {
      urls.push(line.trim());
    }
    // Detect CURLOPT_POSTFIELDS
    if (line.includes('CURLOPT_POSTFIELDS')) {
      postFields.push(line.trim());
    }
  }

  // Extract query params in URL
  const queryParams = new Set();
  urls.forEach(u => {
    const qIdx = u.indexOf('?');
    if (qIdx !== -1) {
      const q = u.substring(qIdx + 1);
      const pairs = q.split('&');
      pairs.forEach(p => {
        const k = p.split('=')[0];
        if (k) queryParams.add(k.replace(/['"]/g, '').trim());
      });
    }
  });

  // Extract form inputs
  const inputs = Array.from(content.matchAll(/name=['"]([^'"]+)['"]/g)).map(m => m[1]);

  detailedMap.push({
    file,
    urls: Array.from(new Set(urls)),
    method: isPost ? 'POST' : 'GET',
    postFields,
    queryParams: Array.from(queryParams),
    formInputs: Array.from(new Set(inputs))
  });
}

fs.writeFileSync('full_member_scripts_audit.json', JSON.stringify(detailedMap, null, 2));
console.log('Saved full audit of ' + detailedMap.length + ' scripts.');
