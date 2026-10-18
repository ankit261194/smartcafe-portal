const fs = require('fs');
const html = fs.readFileSync('client/index.html', 'utf8');

const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (match) {
  try {
    const json = JSON.parse(match[1]);
    console.log('JSON-LD is VALID JSON! Graph items:', json['@graph'].length);
  } catch(e) {
    console.error('JSON-LD PARSE ERROR:', e.message);
  }
} else {
  console.log('No JSON-LD script found!');
}
