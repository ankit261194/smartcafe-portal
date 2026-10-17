import { generateStampedForm49APdf } from '../client/src/utils/form49aStamper.js';
import fs from 'fs';
import path from 'path';

async function testStamper() {
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🧪 TESTING FORM 49A AUTO-STAMPING ENGINE (ZERO PRINT / ZERO SCAN)');
  console.log('═══════════════════════════════════════════════════════════════════════════');

  // 1x1 transparent/white pixel as sample photo & sign
  const samplePhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const sampleSign = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  const testPayload = {
    personal: {
      title: 'Shri',
      firstName: 'Ankit',
      middleName: '',
      lastName: 'Chaudhary',
      gender: 'Male',
      dob: '1998-05-15',
      fatherFirstName: 'Rajendra',
      fatherLastName: 'Singh',
      motherName: '',
      cardParentChoice: 'father',
      mobile: '8006517171',
      email: 'smartcafe.sbs@gmail.com'
    },
    address: {
      flat: 'Shop No 4',
      premises: 'Main Market',
      street: 'Near Bus Stand',
      locality: 'Town Area',
      city: 'Bulandshahar',
      state: 'Uttar Pradesh',
      pincode: '203001'
    },
    aoCode: {
      areaCode: 'KNP',
      aoType: 'W',
      rangeCode: '17',
      aoNumber: '95',
      displayText: 'Uttar Pradesh (BULANDSHAHAR) (KNP W 17 95)'
    },
    identity: {
      dobProof: '10th / Matriculation Marksheet / Certificate (10वीं की अंकतालिका/सनद)',
      aadhaarNumber: '548963217458',
      nameOnAadhaar: 'Ankit Chaudhary',
      signType: 'physical'
    },
    documents: {
      photo: samplePhoto,
      signature: sampleSign
    }
  };

  const result = await generateStampedForm49APdf(testPayload);

  if (!result || !result.pdfBytes || result.pdfBytes.length === 0) {
    throw new Error('PDF Generation returned empty bytes');
  }

  const byteLength = result.pdfBytes.length;
  console.log(`✅ PASS: Form 49A generated successfully! Size: ${(byteLength / 1024).toFixed(2)} KB`);

  // Verify size is well under 2MB (2048 KB)
  if (byteLength > 2 * 1024 * 1024) {
    throw new Error(`PDF size ${(byteLength / 1024).toFixed(2)} KB exceeds 2MB limit!`);
  }
  console.log('✅ PASS: Generated PDF is strictly below 2MB PanSuvidha limit');

  // Verify PDF header magic bytes (%PDF)
  const header = String.fromCharCode(...result.pdfBytes.slice(0, 4));
  if (header !== '%PDF') {
    throw new Error(`Invalid PDF header: ${header}`);
  }
  console.log('✅ PASS: Valid %PDF specification header confirmed');

  // Save sample to disk for verification
  const outPath = path.resolve('uploads/pan_docs/SAMPLE_FORM49A_STAMPED_TEST.pdf');
  fs.writeFileSync(outPath, Buffer.from(result.pdfBytes));
  console.log(`✅ PASS: Test PDF saved to ${outPath}`);

  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('🎉 FORM 49A STAMPER ENGINE TEST: 100% SUCCESS');
  console.log('═══════════════════════════════════════════════════════════════════════════');
}

testStamper().catch(err => {
  console.error('❌ STAMPER TEST FAILED:', err);
  process.exit(1);
});
