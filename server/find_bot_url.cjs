const https = require('https');

// Check Telegram Bot info for Helps_Desk_join_bot
const botUsername = 'Helps_Desk_join_bot';
https.get(`https://api.telegram.org/bot/getMe`, (res) => {
  // We don't have the bot token, but let's check telegram web
});

https.get(`https://t.me/${botUsername}`, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('tg html snippet:');
    const matches = d.match(/tg:\/\/resolve\?domain=[^"']+/g) || [];
    console.log('Matches:', matches);
  });
});
