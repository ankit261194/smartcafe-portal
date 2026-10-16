const fs = require('fs');
const path = require('path');

const membersDir = 'C:\\Users\\hp\\Downloads\\p4points\\p4points\\members';
const files = fs.readdirSync(membersDir).filter(f => f.endsWith('.php'));

const endpointsFound = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(membersDir, file), 'utf8');
  
  // Look for URL patterns or TargetApi calls
  // 1. Strings with /api/ or serviceApi or voter-api or TargetApi
  const lines = content.split('\n');
  const fileEndpoints = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line assigns a URL or has curl_setopt URL
    if (
      line.includes('TargetApi_url') ||
      line.includes('authorized.p4points.co.in') ||
      line.includes('/api/') ||
      line.includes('/serviceApi/') ||
      line.includes('/voter-')
    ) {
      // Find URL template
      const strMatches = line.match(/["'](https?:[^"']+|\/api\/[^"']+|\/serviceApi\/[^"']+|\/voter-[^"']+)["']/g) || [];
      const varConcat = line.match(/\$url\s*=\s*([^;]+);/i) || line.match(/\$apiUrl\s*=\s*([^;]+);/i);
      
      fileEndpoints.push({
        lineNum: i + 1,
        raw: line.trim(),
        strMatches,
        varConcat: varConcat ? varConcat[1].trim() : null
      });
    }
  }

  // Also collect form fields and parameters
  const postParams = Array.from(content.matchAll(/\$_POST\[['"]([^'"]+)['"]\]/g)).map(m => m[1]);
  const getParams = Array.from(content.matchAll(/\$_GET\[['"]([^'"]+)['"]\]/g)).map(m => m[1]);
  
  // Query parameters in URL strings
  const queryParamKeys = [];
  const qMatches = content.matchAll(/[?&]([a-zA-Z0-9_-]+)=/g);
  for (const q of qMatches) {
    if (!['apikey', 'apiKey', 'TargetApi_apikey'].includes(q[1])) {
      queryParamKeys.push(q[1]);
    }
  }

  if (fileEndpoints.length > 0) {
    endpointsFound.push({
      file,
      endpoints: fileEndpoints,
      postParams: Array.from(new Set(postParams)),
      getParams: Array.from(new Set(getParams)),
      queryParamKeys: Array.from(new Set(queryParamKeys))
    });
  }
}

fs.writeFileSync('all_endpoints_discovered.json', JSON.stringify(endpointsFound, null, 2));
console.log('Discovered endpoints in ' + endpointsFound.length + ' files');
