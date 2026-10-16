const fs = require('fs');
const path = require('path');

const membersDir = 'C:\\Users\\hp\\Downloads\\p4points\\p4points\\members';
const files = fs.readdirSync(membersDir).filter(f => f.endsWith('.php'));

const results = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(membersDir, file), 'utf8');
  if (!/curl_exec/i.test(content) && !content.includes('p4points.co.in')) continue;

  // Extract all occurrences of URLs or URL builders
  const lines = content.split('\n');
  const relevantLines = [];
  const postGetVars = new Set();
  const inputNames = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.includes('curl_setopt') ||
      trimmed.includes('CURLOPT_URL') ||
      trimmed.includes('CURLOPT_POSTFIELDS') ||
      trimmed.includes('p4points.co.in') ||
      /\$(url|api|target|endpoint)/i.test(trimmed) ||
      trimmed.includes('file_get_contents')
    ) {
      relevantLines.push(trimmed);
    }

    // $_POST['...'] / $_GET['...']
    const varMatches = trimmed.matchAll(/\$_(POST|GET|REQUEST)\[['"]([^'"]+)['"]\]/g);
    for (const m of varMatches) {
      postGetVars.add(m[2]);
    }

    // <input name="..."
    const inputMatches = trimmed.matchAll(/name=['"]([^'"]+)['"]/g);
    for (const m of inputMatches) {
      inputNames.add(m[1]);
    }
  }

  results.push({
    file,
    postGetVars: Array.from(postGetVars),
    inputNames: Array.from(inputNames),
    relevantLines
  });
}

fs.writeFileSync('detailed_curl_audit.json', JSON.stringify(results, null, 2));
console.log('Processed', results.length, 'files with curl / p4points');
