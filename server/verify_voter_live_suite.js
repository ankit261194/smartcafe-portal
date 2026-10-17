import fs from 'fs';

async function run() {
  console.log('Testing Voter Card Services Suite against local API / server...');

  // Test 1: Service Catalog Check
  const s79 = JSON.parse(fs.readFileSync('client/src/data/services_79.json', 'utf8'));
  const voterSvcs = s79.filter(x => x.category === 'voter' || x.id.includes('voter'));
  console.log(`Found ${voterSvcs.length} voter services in catalog.`);
  for (const s of voterSvcs) {
    console.log(` - [${s.id}] ${s.name} | Endpoint: ${s.apiEndpoint} | Badge: ${s.badge}`);
  }

  // Test 2: Verify user 8006518960 balance
  const store = JSON.parse(fs.readFileSync('client/public/api/data/store.json', 'utf8'));
  const u = store.wallets.find(w => w.phone === '8006518960');
  console.log(`User 8006518960 wallet balance: ₹${u ? u.balance : 'NOT FOUND'}`);
  if (!u || u.balance !== 10) {
    throw new Error(`CRITICAL: User balance is not 10! Found: ${u?.balance}`);
  }

  console.log('✅ Voter suite preliminary assertions passed.');
}

run().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
