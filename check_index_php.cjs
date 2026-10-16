const fs = require('fs');
const content = fs.readFileSync('client/public/api/index.php', 'utf8');
let openBraces = 0;
let inString = false;
let stringChar = '';
let inComment = false;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  const next = content[i + 1];
  if (!inString && !inComment && c === '/' && next === '/') {
    const end = content.indexOf('\n', i);
    i = end === -1 ? content.length : end;
    continue;
  }
  if (!inString && !inComment && c === '/' && next === '*') {
    const end = content.indexOf('*/', i);
    i = end === -1 ? content.length : end + 1;
    continue;
  }
  if (!inComment && (c === '"' || c === "'")) {
    if (!inString) {
      inString = true;
      stringChar = c;
    } else if (stringChar === c && content[i - 1] !== '\\') {
      inString = false;
    }
    continue;
  }
  if (!inString && !inComment) {
    if (c === '{') openBraces++;
    if (c === '}') openBraces--;
  }
}
console.log('Open braces remaining in index.php:', openBraces);
