const fs = require('fs');
const path = require('path');

const membersDir = 'C:\\Users\\hp\\Downloads\\p4points\\p4points\\members';
const files = fs.readdirSync(membersDir).filter(f => f.endsWith('.php'));

const report = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(membersDir, file), 'utf8');
  
  // Extract curl_init or curl_setopt lines
  const curlLines = content.split('\n').filter(line => 
    line.includes('curl_init') || 
    line.includes('CURLOPT_URL') || 
    line.includes('file_get_contents') ||
    line.includes('p4points.co.in') ||
    line.includes('/api/') ||
    line.includes('apikey') ||
    line.includes('apiKey')
  ).map(l => l.trim());

  // Extract variables like $url = ...
  const urlVarLines = content.split('\n').filter(line =>
    /\$(url|api_url|targetUrl|endpoint|request_url)\s*=/i.test(line)
  ).map(l => l.trim());

  report.push({
    file,
    curlLines: curlLines.slice(0, 15),
    urlVarLines: urlVarLines.slice(0, 10),
    hasCurl: /curl_exec/i.test(content),
    contentLength: content.length
  });
}

fs.writeFileSync('all_members_audit.json', JSON.stringify(report, null, 2));
console.log('Audited ' + report.length + ' files. Files with curl: ' + report.filter(r => r.hasCurl).length);
