const https = require('https');

https.get('https://t.me/Helps_Desk_join_bot', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Length:', d.length);
    const m = d.match(/https?:\/\/[^"'\\s>]+/g) || [];
    console.log('Urls:', m.filter(u => !u.includes('telegram') && !u.includes('t.me') && !u.includes('schema.org')));
    const desc = d.match(/class="tgme_page_description"[^>]*>([\s\S]*?)<\/div>/);
    if (desc) console.log('Desc:', desc[1]);
  });
}).on('error', e => console.error(e.message));
