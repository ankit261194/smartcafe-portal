const fs = require('fs');

const legacy = JSON.parse(fs.readFileSync('full_member_scripts_audit.json', 'utf8'));

const groups = {
  aadhaar: [],
  pan: [],
  voter: [],
  ration: [],
  dl_ll: [],
  rc_vehicle: [],
  welfare_agri_eshram: [],
  utility_electric: [],
  banking_lookup: [],
  other: []
};

for (const item of legacy) {
  const f = item.file.toLowerCase();
  if (f.includes('aadhaar') || f.includes('aadhar') || f.includes('uid')) {
    groups.aadhaar.push(item);
  } else if (f.includes('pan') || f.includes('gst')) {
    groups.pan.push(item);
  } else if (f.includes('voter') || f.includes('epic') || f.includes('vcm')) {
    groups.voter.push(item);
  } else if (f.includes('ration')) {
    groups.ration.push(item);
  } else if (f.includes('dl') || f.includes('ll') || f.includes('licence') || f.includes('sarathi')) {
    groups.dl_ll.push(item);
  } else if (f.includes('rc') || f.includes('vahan') || f.includes('chassis') || f.includes('engine') || f.includes('challan')) {
    groups.rc_vehicle.push(item);
  } else if (f.includes('shram') || f.includes('agri') || f.includes('farmer') || f.includes('rtps') || f.includes('samagra') || f.includes('sambal') || f.includes('abha')) {
    groups.welfare_agri_eshram.push(item);
  } else if (f.includes('electric') || f.includes('bill') || f.includes('pincode')) {
    groups.utility_electric.push(item);
  } else if (f.includes('npci') || f.includes('mobile') || f.includes('bank') || f.includes('upi') || f.includes('lookup')) {
    groups.banking_lookup.push(item);
  } else {
    groups.other.push(item);
  }
}

for (const [k, v] of Object.entries(groups)) {
  console.log(`\n=== GROUP: ${k.toUpperCase()} (${v.length} scripts) ===`);
  for (const s of v) {
    console.log(`- ${s.file}`);
    console.log(`    URLs: ${s.urls.slice(0, 3).join(', ')}`);
    console.log(`    QueryParams: ${s.queryParams.join(', ')}`);
    console.log(`    FormInputs: ${s.formInputs.join(', ')}`);
  }
}
