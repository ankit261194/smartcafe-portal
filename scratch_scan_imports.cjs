const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Check if CreditCard is used
  if (content.includes('CreditCard')) {
    const isImported = content.includes('CreditCard') && (content.includes('import ') && content.indexOf('CreditCard') < content.indexOf('export'));
    if (!content.match(/import\s*\{[^}]*CreditCard[^}]*\}\s*from/)) {
      console.log(`WARNING: CreditCard might not be imported in ${filePath}`);
    }
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.jsx')) checkFile(full);
  });
}

walk('client/src');
console.log('Finished scan for CreditCard imports.');
