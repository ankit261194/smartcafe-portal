const fs = require('fs');
const content = fs.readFileSync('client/public/api/index.php', 'utf8');

const stack = [];
let inComment = false;
let inLineComment = false;
let inString = false;
let strQuote = '';

const lines = content.split('\n');
for (let lineNum = 0; lineNum < lines.length; lineNum++) {
  const line = lines[lineNum];
  for (let col = 0; col < line.length; col++) {
    const c = line[col];
    const next = col + 1 < line.length ? line[col+1] : '';
    const prev = col > 0 ? line[col-1] : '';

    if (inLineComment) continue;
    if (inComment) {
      if (c === '*' && next === '/') {
        inComment = false;
        col++;
      }
      continue;
    }
    if (inString) {
      if (c === strQuote && prev !== '\\') {
        inString = false;
      }
      continue;
    }

    if (c === '/' && next === '/') {
      inLineComment = true;
      break;
    }
    if (c === '#' && !inString) {
      inLineComment = true;
      break;
    }
    if (c === '/' && next === '*') {
      inComment = true;
      col++;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      strQuote = c;
      continue;
    }

    if (c === '{') {
      stack.push({ line: lineNum + 1, text: line.trim() });
    } else if (c === '}') {
      if (stack.length === 0) {
        console.log(`Extra '}' at line ${lineNum + 1}: ${line}`);
      } else {
        stack.pop();
      }
    }
  }
  inLineComment = false;
}

console.log('Unclosed braces left:', stack.length);
stack.forEach(item => {
  console.log(`Unclosed '{' opened at line ${item.line}: ${item.text}`);
});
