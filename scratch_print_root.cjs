const fs = require('fs');
const content = fs.readFileSync('dom_rendered.html', 'utf8');
const rootStart = content.indexOf('<div id="root">');
console.log(content.substring(rootStart, rootStart + 1500));
