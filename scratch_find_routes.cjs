const fs = require('fs');
const content = fs.readFileSync('client/public/api/index.php', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes("$endpoint === 'services'") || l.includes("$endpoint === 'services/rates'") || l.includes("endpoint === 'services")) {
    console.log(i + 1, l.trim());
  }
});
