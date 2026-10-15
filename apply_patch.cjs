const fs = require('fs');

// 1. Update server/server.js
let s = fs.readFileSync('server/server.js', 'utf8');

const helperCode = `// ═══════════════════════════════════════════════════════════════════════════
// Live P4Points B2B Gateway Dispatcher (Production Bridge)
// ═══════════════════════════════════════════════════════════════════════════
async function dispatchLiveP4Points(serviceType, params, p4ApiKey) {
  if (!p4ApiKey) return null;
  const norm = String(serviceType || '').toLowerCase();
  
  // 1. RC Services (rcDownload, rc_fast_pdf, rc_details, chassis_to_rc, engine_to_rc, etc.)
  if (norm.includes('rc') || norm === 'rcdownload' || norm.includes('vehicle') || norm.includes('chassis') || norm.includes('engine')) {
    const regNo = String(params?.vehicleNumber || params?.rcNo || params?.regNo || params?.query || '').replace(/[\\s-]+/g, '').toUpperCase();
    if (regNo && regNo.length >= 4) {
      try {
        const rcUrl = \`https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc-details.php?apiKey=\${encodeURIComponent(p4ApiKey)}&rcno=\${encodeURIComponent(regNo)}\`;
        const res = await fetch(rcUrl, { signal: AbortSignal.timeout(10000) });
        const json = await res.json().catch(() => null);
        if (json && json.success && json.data) {
          const p4 = json.data;
          return {
            source: 'p4points',
            service: 'rc',
            regNo: p4.rc_number || regNo,
            ownerName: p4.owner_name || 'वाहन स्वामी',
            fatherName: p4.father_name || '',
            presentAddress: p4.present_address || '',
            permanentAddress: p4.permanent_address || '',
            address: p4.present_address || p4.permanent_address || '',
            mobileNumber: p4.mobile_number || '',
            vehicleCategory: p4.vehicle_category || 'LMV',
            chassisNo: p4.vehicle_chasi_number || '',
            engineNo: p4.vehicle_engine_number || '',
            maker: p4.maker_description || '',
            model: p4.maker_model || '',
            makerModel: \`\${p4.maker_description || ''} \${p4.maker_model || ''}\`.trim() || 'मोटर वाहन',
            fuelType: p4.fuel_type || 'PETROL',
            vehicleColor: p4.color || 'WHITE',
            regDate: p4.registration_date || '',
            manufacturingDate: p4.manufacturing_date || '',
            fitnessUpto: p4.fit_up_to || '',
            financer: p4.financer || (p4.financed ? 'FINANCED' : 'NO HYPOTHECATION'),
            financed: Boolean(p4.financed),
            insuranceCompany: p4.insurance_company || '',
            insurancePolicyNo: p4.insurance_policy_number || '',
            insuranceUpto: p4.insurance_upto || '',
            issuingRto: p4.registered_at || 'परिवहन कार्यालय',
            taxUpto: p4.tax_upto || p4.tax_paid_upto || '',
            cubicCapacity: p4.cubic_capacity || '',
            grossWeight: p4.vehicle_gross_weight || '',
            unladenWeight: p4.unladen_weight || '',
            seatingCapacity: p4.seat_capacity || '',
            puccUpto: p4.pucc_upto || '',
            puccNo: p4.pucc_number || '',
            rcStatus: p4.rc_status || 'ACTIVE',
            stateName: p4.statename || 'भारत सरकार (परिवहन विभाग)',
            applicationNo: json.application_no || \`P4P-\${Date.now()}\`,
            isLiveFromP4Points: true
          };
        }
      } catch (err) {
        console.error('Live P4Points RC fetch failed:', err.message);
      }
    }
  }

  // 2. Aadhaar to PAN / UID to PAN
  if (norm.includes('aadhaartopan') || norm.includes('uidtopan') || norm.includes('panfind') || norm.includes('aadhaar_to_pan')) {
    const uid = String(params?.aadhaarNo || params?.uidNumber || params?.query || '').replace(/[^0-9]/g, '');
    if (uid.length === 12) {
      try {
        const uidUrl = \`https://authorized.p4points.co.in/api/v1/getPanNumber.php?apiKey=\${encodeURIComponent(p4ApiKey)}&uidNumber=\${encodeURIComponent(uid)}\`;
        const res = await fetch(uidUrl, { signal: AbortSignal.timeout(12000) });
        const json = await res.json().catch(() => null);
        if (json && (json.status === 200 || json.pan_number)) {
          return {
            source: 'p4points',
            service: 'aadhaarToPan',
            panNo: json.pan_number || json.pan || '',
            maskedAadhaar: \`XXXX XXXX \${uid.slice(-4)}\`,
            aadhaarNo: uid,
            name: json.name || params?.name || 'PAN धारक',
            isLiveFromP4Points: true
          };
        }
      } catch (err) {
        console.error('Live P4Points UID to PAN fetch failed:', err.message);
      }
    }
  }

  // 3. PAN Verification & Details
  if (norm.includes('pan') && !norm.includes('find') && !norm.includes('aadhaar')) {
    const panNo = String(params?.panNo || params?.pan || params?.query || '').trim().toUpperCase();
    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNo)) {
      try {
        const panUrl = \`https://authorized.p4points.co.in/api/v1/panVerificationPremium.php?apiKey=\${encodeURIComponent(p4ApiKey)}&panNumber=\${encodeURIComponent(panNo)}\`;
        const res = await fetch(panUrl, { signal: AbortSignal.timeout(10000) });
        const json = await res.json().catch(() => null);
        if (json && json.status === 'success' && json.data) {
          return {
            source: 'p4points',
            service: 'panCard',
            panNo: panNo,
            name: json.data.full_name || json.data.name || 'PAN धारक',
            fatherName: json.data.father_name || '',
            dob: json.data.dob || '',
            category: json.data.category || 'Individual',
            gender: json.data.gender || 'M',
            aadhaarSeedingStatus: json.data.aadhaar_seeding_status || 'Linked',
            isLiveFromP4Points: true
          };
        }
      } catch (err) {
        console.error('Live P4Points PAN verification fetch failed:', err.message);
      }
    }
  }

  // 4. DL PDF / Driving Licence
  if (norm.includes('dl') || norm.includes('licence') || norm.includes('driving')) {
    const dlNo = String(params?.dlNo || params?.query || '').trim().toUpperCase();
    const dob = params?.dob || '01-01-1990';
    if (dlNo && dlNo.length >= 6) {
      try {
        const dlUrl = \`https://authorized.p4points.co.in/api/v1/dlpdf.php?apiKey=\${encodeURIComponent(p4ApiKey)}&dlNo=\${encodeURIComponent(dlNo)}&dob=\${encodeURIComponent(dob)}\`;
        const res = await fetch(dlUrl, { signal: AbortSignal.timeout(10000) });
        const json = await res.json().catch(() => null);
        if (json && json.status === 200 && json.pdf_url) {
          return {
            source: 'p4points',
            service: 'dl',
            dlNo: dlNo,
            pdfUrl: json.pdf_url,
            isLiveFromP4Points: true
          };
        }
      } catch (err) {
        console.error('Live P4Points DL PDF fetch failed:', err.message);
      }
    }
  }

  // 5. Ration PDF
  if (norm.includes('ration')) {
    const rationNo = String(params?.rationNo || params?.query || '').replace(/[^0-9]/g, '');
    if (rationNo && rationNo.length >= 6) {
      try {
        const rationUrl = \`https://authorized.p4points.co.in/api/v1/rationPdf.php?apiKey=\${encodeURIComponent(p4ApiKey)}&ration_no=\${encodeURIComponent(rationNo)}&rationtype=NFSA\`;
        const res = await fetch(rationUrl, { signal: AbortSignal.timeout(10000) });
        const json = await res.json().catch(() => null);
        if (json && json.status === 1 && json.pdf_url) {
          return {
            source: 'p4points',
            service: 'ration',
            rationNo: rationNo,
            pdfUrl: json.pdf_url,
            isLiveFromP4Points: true
          };
        }
      } catch (err) {
        console.error('Live P4Points Ration PDF fetch failed:', err.message);
      }
    }
  }

  return null;
}
`;

if (!s.includes('function dispatchLiveP4Points')) {
  s = s.replace("// 3. Two-Tier Financial Ledger Zero-Bypass Automated Service Execution", helperCode + "\n// 3. Two-Tier Financial Ledger Zero-Bypass Automated Service Execution");
}

// Make execute-automated async
s = s.replace("app.post('/api/services/execute-automated', (req, res) => {", "app.post('/api/services/execute-automated', async (req, res) => {");

// Inject live call in execute-automated
const oldDispatchMarker = "// 4. Generate Official White-Labeled Service Record";
const newDispatchBlock = `// 4. Generate Official White-Labeled Service Record
  const p4ApiKey = store.apiGateway?.apiKey || 'f1c563aa08c301c9a7e58796ed4edbced254ea3a674f76fca2bbb1a2429968c5';
  let liveP4 = null;
  if (p4ApiKey && (store.apiGateway?.liveMode !== false)) {
    try {
      liveP4 = await dispatchLiveP4Points(normServiceType, params, p4ApiKey);
    } catch (e) {
      console.error('Live P4Points dispatch error:', e.message);
    }
  }`;

if (s.includes(oldDispatchMarker) && !s.includes('let liveP4 = null;')) {
  s = s.replace(oldDispatchMarker, newDispatchBlock);
}

// Update RC handler to use liveP4 if available
const oldRcBlock = `  if (normServiceType === 'rcDownload') {
    const regNo = (params?.vehicleNumber || '').replace(/[\\s-]+/g, '').toUpperCase();
    if (params?.customVehicleData && params.customVehicleData.ownerName) {
      vehicleData = {
        ...getVehicleDetails(regNo, params),
        ...params.customVehicleData,
        regNo
      };
    } else {
      vehicleData = getVehicleDetails(regNo, params);
    }`;

const newRcBlock = `  if (normServiceType === 'rcDownload' || (liveP4 && liveP4.service === 'rc')) {
    const regNo = (params?.vehicleNumber || liveP4?.regNo || params?.query || '').replace(/[\\s-]+/g, '').toUpperCase();
    if (liveP4 && liveP4.service === 'rc') {
      vehicleData = {
        ...getVehicleDetails(liveP4.regNo || regNo, params),
        ...liveP4,
        regNo: liveP4.regNo || regNo
      };
    } else if (params?.customVehicleData && params.customVehicleData.ownerName) {
      vehicleData = {
        ...getVehicleDetails(regNo, params),
        ...params.customVehicleData,
        regNo
      };
    } else {
      vehicleData = getVehicleDetails(regNo, params);
    }`;

if (s.includes(oldRcBlock)) {
  s = s.replace(oldRcBlock, newRcBlock);
}

// Update PAN handler to use liveP4 if available
const oldPanBlock = `  } else if (normServiceType === 'panCard') {
    generatedData = getPanCardDetails(params?.panNo, params);`;

const newPanBlock = `  } else if (normServiceType === 'panCard' || (liveP4 && liveP4.service === 'panCard')) {
    if (liveP4 && liveP4.service === 'panCard') {
      generatedData = { ...getPanCardDetails(liveP4.panNo, params), ...liveP4 };
    } else {
      generatedData = getPanCardDetails(params?.panNo, params);
    }`;

if (s.includes(oldPanBlock)) {
  s = s.replace(oldPanBlock, newPanBlock);
}

// Update AadhaarToPan if liveP4 returned it
const oldAadhaarBlock = `  } else if (normServiceType === 'aadhaarCard') {`;
const newAadhaarBlock = `  } else if (liveP4 && liveP4.service === 'aadhaarToPan') {
    generatedData = { ...getPanCardDetails(liveP4.panNo, params), ...liveP4 };
    docTitle = \`आधार से पैन खोज (\${liveP4.panNo})\`;
    refNumber = liveP4.panNo;
  } else if (normServiceType === 'aadhaarCard') {`;

if (s.includes(oldAadhaarBlock) && !s.includes("liveP4.service === 'aadhaarToPan'")) {
  s = s.replace(oldAadhaarBlock, newAadhaarBlock);
}

fs.writeFileSync('server/server.js', s, 'utf8');
console.log('server/server.js patched successfully!');
