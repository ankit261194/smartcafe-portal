const fs = require('fs');
const content = fs.readFileSync('client/src/data/serviceFormSchemas.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  const m = l.match(/placeholder:\s*['"]([^'"]+)['"]/);
  if (m) {
    console.log(`${i+1}: ${m[1]}`);
  }
});
