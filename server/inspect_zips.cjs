const { execSync } = require('child_process');
const fs = require('fs');

const zips = ['C:/Users/hp/Downloads/all scr.zip', 'C:/Users/hp/Downloads/assdfghjkl.zip'];
zips.forEach(z => {
  try {
    const out = execSync(`tar -tf "${z}"`, { encoding: 'utf8' });
    const lines = out.trim().split(/\r?\n/).filter(Boolean);
    console.log(z, 'total files:', lines.length);
    console.log('First 5:', lines.slice(0, 5));
    console.log('Last 5:', lines.slice(-5));
  } catch(e) {
    console.error(e.message);
  }
});
