const fs = require('fs');

const data = JSON.parse(fs.readFileSync('all_endpoints_discovered.json', 'utf8'));

console.log('Total files discovered:', data.length);

const summary = [];

for (const item of data) {
  const urls = [];
  for (const ep of item.endpoints) {
    if (ep.strMatches && ep.strMatches.length > 0) {
      urls.push(...ep.strMatches);
    } else if (ep.varConcat) {
      urls.push(ep.varConcat);
    } else {
      urls.push(ep.raw);
    }
  }

  summary.push({
    file: item.file,
    urls: Array.from(new Set(urls)),
    postParams: item.postParams,
    queryParamKeys: item.queryParamKeys
  });
}

fs.writeFileSync('endpoints_summary.json', JSON.stringify(summary, null, 2));

summary.forEach((s, idx) => {
  console.log(`${idx + 1}. [${s.file}]`);
  console.log('   URLs:', s.urls.slice(0, 3).join(' | '));
  console.log('   POST params:', s.postParams.join(', '));
  console.log('   Query params:', s.queryParamKeys.join(', '));
});
