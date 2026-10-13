const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'client', 'src', 'components');
fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).forEach(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  const m = c.match(/grid-cols-1[^\"]*/g);
  if (m) {
    console.log(f, ':', m.slice(0, 4));
  }
});
