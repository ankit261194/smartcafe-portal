import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

/**
 * Universal helper to convert any image or document input into a Uint8Array.
 * Supports:
 * - Uint8Array / ArrayBuffer
 * - Base64 Data URL (data:image/jpeg;base64,...)
 * - Pure Base64 string
 * - Remote or local URL (in browser or node via fetch)
 */
async function toBytes(input) {
  if (!input) return null;
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);

  // If browser File / Blob
  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    const buffer = await input.arrayBuffer();
    return new Uint8Array(buffer);
  }

  if (typeof input === 'string') {
    // Check if Base64 Data URI
    if (input.startsWith('data:')) {
      const commaIdx = input.indexOf(',');
      const base64Data = commaIdx !== -1 ? input.slice(commaIdx + 1) : input;
      if (typeof Buffer !== 'undefined') {
        return new Uint8Array(Buffer.from(base64Data, 'base64'));
      }
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return bytes;
    }

    // Check if pure base64 (no data prefix)
    if (/^[A-Za-z0-9+/=]+$/.test(input.trim()) && input.trim().length > 100) {
      if (typeof Buffer !== 'undefined') {
        return new Uint8Array(Buffer.from(input.trim(), 'base64'));
      }
      const binaryStr = atob(input.trim());
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return bytes;
    }

    // HTTP / Relative URL
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch(input);
        if (res.ok) {
          const ab = await res.arrayBuffer();
          return new Uint8Array(ab);
        }
      }
    } catch (e) {
      console.warn('[form49aStamper] Failed to fetch document URL:', input, e.message);
    }
  }

  return null;
}

/**
 * Embed an image (JPG or PNG) safely into a pdf-lib PDFDocument.
 */
async function embedImage(pdfDoc, imageInput) {
  const bytes = await toBytes(imageInput);
  if (!bytes || bytes.length === 0) return null;

  // Check header magic bytes
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  const isJpg = bytes[0] === 0xFF && bytes[1] === 0xD8;

  try {
    if (isPng) {
      return await pdfDoc.embedPng(bytes);
    } else if (isJpg) {
      return await pdfDoc.embedJpg(bytes);
    } else {
      // Attempt embedPng first, fallback to embedJpg
      try {
        return await pdfDoc.embedPng(bytes);
      } catch {
        return await pdfDoc.embedJpg(bytes);
      }
    }
  } catch (err) {
    console.warn('[form49aStamper] Failed to embed image:', err.message);
    return null;
  }
}

/**
 * Sanitize text to ensure WinAnsi compatibility (ASCII printable only).
 * Strips Hindi/non-Latin characters and bracketed translations.
 */
function cleanAscii(str) {
  if (!str) return '';
  return String(str)
    .replace(/\([^)]*[\u0900-\u097F]+[^)]*\)/g, '') // remove bracketed Hindi e.g. (जन्म प्रमाण पत्र)
    .replace(/[\u0900-\u097F]/g, '') // remove any stray Devanagari chars
    .replace(/[^\x20-\x7E]/g, ' ') // replace non-ASCII with space
    .replace(/\s+/g, ' ')
    .trim();
}

function attachSafeDrawText(page) {
  const origDrawText = page.drawText.bind(page);
  page.drawText = (text, options) => {
    const cleaned = cleanAscii(text);
    if (!cleaned) return;
    try {
      return origDrawText(cleaned, options);
    } catch (e) {
      console.warn('[form49aStamper] drawText failed:', e.message);
    }
  };
}

/**
 * 100% Digital Form 49A Auto-Stamping & Document Merging Engine
 * Accurately stamps Photo 1 & Photo 2, overlays 15° angled cross-sign across left photo,
 * centers signature in right box & page 2 declaration, and merges Aadhaar & DOB proof into a <2MB PDF.
 *
 * @param {Object} data Application details and uploaded documents
 * @returns {Promise<{ pdfBytes: Uint8Array, blob: Blob, dataUrl: string }>}
 */
export async function generateStampedForm49APdf(data = {}) {
  const pdfDoc = await PDFDocument.create();

  // Standard Fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = rgb(0.08, 0.12, 0.25);
  const darkTextColor = rgb(0.1, 0.1, 0.1);
  const borderColor = rgb(0.2, 0.2, 0.25);
  const lightBg = rgb(0.96, 0.97, 0.99);

  const personal = data.personal || {};
  const address = data.address || {};
  const aoCode = data.aoCode || {};
  const identity = data.identity || {};
  const documents = data.documents || {};

  const applicantFullName = [personal.firstName, personal.middleName, personal.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toUpperCase();

  const fatherFullName = [personal.fatherFirstName, personal.fatherMiddleName, personal.fatherLastName || personal.fatherName]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toUpperCase();

  const formattedDob = personal.dob || '01-01-1990';
  const dobParts = formattedDob.includes('-') ? formattedDob.split('-') : formattedDob.split('/');
  let dobDay = '01', dobMonth = '01', dobYear = '1990';
  if (dobParts.length === 3) {
    if (dobParts[0].length === 4) {
      dobYear = dobParts[0];
      dobMonth = dobParts[1].padStart(2, '0');
      dobDay = dobParts[2].padStart(2, '0');
    } else {
      dobDay = dobParts[0].padStart(2, '0');
      dobMonth = dobParts[1].padStart(2, '0');
      dobYear = dobParts[2];
    }
  }

  // Pre-embed images
  const photoInput = documents.photo || data.photo;
  const signatureInput = documents.signature || data.signature;
  const embeddedPhoto = photoInput ? await embedImage(pdfDoc, photoInput) : null;
  const embeddedSign = signatureInput ? await embedImage(pdfDoc, signatureInput) : null;

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1: FORM NO. 49A (Front Page)
  // ═══════════════════════════════════════════════════════════════════════════
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4: 595.28 x 841.89 pts
  attachSafeDrawText(page1);
  const { width, height } = page1.getSize();

  // Outer Page Border
  page1.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderWidth: 1.2,
    borderColor: borderColor,
    color: rgb(1, 1, 1)
  });

  // Top Header Banner
  page1.drawRectangle({
    x: 20,
    y: height - 60,
    width: width - 40,
    height: 38,
    color: rgb(0.95, 0.96, 0.98),
    borderWidth: 0.8,
    borderColor: borderColor
  });

  page1.drawText('FORM NO. 49A', {
    x: width / 2 - 45,
    y: height - 36,
    size: 13,
    font: fontBold,
    color: primaryColor
  });

  page1.drawText('Application for Allotment of Permanent Account Number (PAN)', {
    x: width / 2 - 130,
    y: height - 48,
    size: 8.5,
    font: fontBold,
    color: darkTextColor
  });

  page1.drawText('[Under Section 139A of the Income Tax Act, 1961] — For Indian Citizens', {
    x: width / 2 - 120,
    y: height - 57,
    size: 7,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3)
  });

  // Assessing Officer (AO) Code Box in Header Center
  const aoBoxX = 132;
  const aoBoxY = height - 128;
  const aoBoxW = 330;
  const aoBoxH = 58;

  page1.drawRectangle({
    x: aoBoxX,
    y: aoBoxY,
    width: aoBoxW,
    height: aoBoxH,
    borderWidth: 1,
    borderColor: borderColor,
    color: lightBg
  });

  page1.drawText('To, The Assessing Officer (AO)', {
    x: aoBoxX + 6,
    y: aoBoxY + aoBoxH - 12,
    size: 7.5,
    font: fontBold,
    color: primaryColor
  });

  // AO Code 4 Columns
  const aoCols = [
    { label: 'Area Code', val: (aoCode.areaCode || '---').toUpperCase(), w: 75 },
    { label: 'AO Type', val: (aoCode.aoType || '---').toUpperCase(), w: 75 },
    { label: 'Range Code', val: (aoCode.rangeCode || '---').toUpperCase(), w: 90 },
    { label: 'AO No.', val: (aoCode.aoNumber || '---').toUpperCase(), w: 90 }
  ];

  let curX = aoBoxX;
  aoCols.forEach((col, idx) => {
    // Column header
    page1.drawRectangle({
      x: curX,
      y: aoBoxY + 22,
      width: col.w,
      height: 18,
      borderWidth: 0.6,
      borderColor: borderColor,
      color: rgb(0.9, 0.93, 0.97)
    });
    page1.drawText(col.label, {
      x: curX + (col.w / 2) - (col.label.length * 2.2),
      y: aoBoxY + 27,
      size: 7,
      font: fontBold,
      color: darkTextColor
    });

    // Column Value
    page1.drawRectangle({
      x: curX,
      y: aoBoxY + 2,
      width: col.w,
      height: 20,
      borderWidth: 0.6,
      borderColor: borderColor,
      color: rgb(1, 1, 1)
    });
    page1.drawText(col.val, {
      x: curX + (col.w / 2) - (col.val.length * 3),
      y: aoBoxY + 7,
      size: 9.5,
      font: fontBold,
      color: primaryColor
    });

    curX += col.w;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // LEFT PHOTO BOX & 15° ANGLED CROSS-SIGNATURE OVERLAY
  // ─────────────────────────────────────────────────────────────────────────
  const leftPhotoX = 26;
  const leftPhotoY = height - 195;
  const photoW = 95;
  const photoH = 125;

  page1.drawRectangle({
    x: leftPhotoX,
    y: leftPhotoY,
    width: photoW,
    height: photoH,
    borderWidth: 1,
    borderColor: borderColor,
    color: rgb(0.97, 0.97, 0.97)
  });

  page1.drawText('Affix Passport Size\nPhotograph Here\n(3.5 cm x 2.5 cm)', {
    x: leftPhotoX + 8,
    y: leftPhotoY + 75,
    size: 7,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
    lineHeight: 11
  });

  if (embeddedPhoto) {
    // Stamp Photo 1 on Left Box
    page1.drawImage(embeddedPhoto, {
      x: leftPhotoX + 2,
      y: leftPhotoY + 2,
      width: photoW - 4,
      height: photoH - 4
    });
  }

  // 15° Angled Cross-Signature across Left Photo
  // Official Form 49A Law: Applicant signs across the photograph so it spans photo + form
  if (embeddedSign) {
    const signW = 92;
    const signH = 36;
    page1.drawImage(embeddedSign, {
      x: leftPhotoX + 10,
      y: leftPhotoY - 8,
      width: signW,
      height: signH,
      rotate: degrees(15) // Exactly 15° angled cross-signature
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RIGHT PHOTO BOX & CENTERED SIGNATURE BOX
  // ─────────────────────────────────────────────────────────────────────────
  const rightPhotoX = width - 121;
  const rightPhotoY = height - 195;

  page1.drawRectangle({
    x: rightPhotoX,
    y: rightPhotoY,
    width: photoW,
    height: photoH,
    borderWidth: 1,
    borderColor: borderColor,
    color: rgb(0.97, 0.97, 0.97)
  });

  page1.drawText('Affix Passport Size\nPhotograph Here\n(3.5 cm x 2.5 cm)', {
    x: rightPhotoX + 8,
    y: rightPhotoY + 75,
    size: 7,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
    lineHeight: 11
  });

  if (embeddedPhoto) {
    // Stamp Photo 2 on Right Box (Clean without cross sign)
    page1.drawImage(embeddedPhoto, {
      x: rightPhotoX + 2,
      y: rightPhotoY + 2,
      width: photoW - 4,
      height: photoH - 4
    });
  }

  // Right Signature Box Strictly Below Right Photo
  const rightSignBoxY = rightPhotoY - 56;
  const rightSignBoxH = 50;

  page1.drawRectangle({
    x: rightPhotoX,
    y: rightSignBoxY,
    width: photoW,
    height: rightSignBoxH,
    borderWidth: 1.2,
    borderColor: borderColor,
    color: rgb(1, 1, 1)
  });

  page1.drawText('Signature / Left Thumb', {
    x: rightPhotoX + 6,
    y: rightSignBoxY + 3,
    size: 6,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4)
  });

  if (embeddedSign) {
    // Centered cleanly inside right signature box
    const signW = 85;
    const signH = 34;
    page1.drawImage(embeddedSign, {
      x: rightPhotoX + (photoW - signW) / 2,
      y: rightSignBoxY + (rightSignBoxH - signH) / 2 + 3,
      width: signW,
      height: signH
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORM FIELDS DATA GRID (PAGE 1)
  // ─────────────────────────────────────────────────────────────────────────
  let cursorY = height - 262;
  const tableX = 26;
  const tableW = width - 52;

  function drawFieldRow(label, value, rowHeight = 22, isHeader = false) {
    page1.drawRectangle({
      x: tableX,
      y: cursorY - rowHeight,
      width: tableW,
      height: rowHeight,
      borderWidth: 0.6,
      borderColor: borderColor,
      color: isHeader ? rgb(0.93, 0.95, 0.98) : rgb(1, 1, 1)
    });

    page1.drawText(label, {
      x: tableX + 8,
      y: cursorY - rowHeight + 6,
      size: 7.5,
      font: isHeader ? fontBold : fontRegular,
      color: isHeader ? primaryColor : darkTextColor
    });

    if (value) {
      page1.drawText(String(value).slice(0, 75), {
        x: tableX + 210,
        y: cursorY - rowHeight + 6,
        size: 8,
        font: fontBold,
        color: darkTextColor
      });
    }

    cursorY -= rowHeight;
  }

  // Row 1: Title & Full Name
  const title = personal.title || 'Shri';
  drawFieldRow('1. Full Name (Title: Shri/Smt/Kumari)', `[ ${title} ]  ${applicantFullName}`, 22);

  // Row 1b: Breakdown
  drawFieldRow('    Last Name / Surname (Mandatory)', personal.lastName?.toUpperCase() || '---', 19);
  drawFieldRow('    First Name', personal.firstName?.toUpperCase() || '---', 19);
  drawFieldRow('    Middle Name', personal.middleName?.toUpperCase() || '---', 19);

  // Row 2: Name printed on PAN
  drawFieldRow('2. Name as you would like printed on card', applicantFullName, 22);

  // Row 3: Known by other name
  drawFieldRow('3. Have you ever been known by any other name?', 'NO [X]     YES [ ]', 20);

  // Row 4: Gender
  const gender = (personal.gender || 'Male').toUpperCase();
  drawFieldRow('4. Gender of Applicant', `${gender} [X]`, 20);

  // Row 5: Date of Birth
  drawFieldRow('5. Date of Birth (DD-MM-YYYY)', `${dobDay} / ${dobMonth} / ${dobYear}`, 22);

  // Row 6: Details of Parents
  drawFieldRow("6. Details of Father (Even for married female)", fatherFullName, 22);
  drawFieldRow("    Mother's Name (Optional)", personal.motherName?.toUpperCase() || 'NOT APPLICABLE', 19);
  drawFieldRow("    Print Parent Name on Card", personal.cardParentChoice === 'mother' ? 'MOTHER [X]' : 'FATHER [X]', 19);

  // Row 7: Residence Address
  drawFieldRow('7. Residence Address', '', 20, true);
  drawFieldRow('    Flat / Door / Block No.', (address.flat || '---').toUpperCase(), 18);
  drawFieldRow('    Premises / Building / Village', (address.premises || '---').toUpperCase(), 18);
  drawFieldRow('    Road / Street / Lane / Post Office', (address.street || '---').toUpperCase(), 18);
  drawFieldRow('    Area / Locality / Taluka', (address.locality || '---').toUpperCase(), 18);
  drawFieldRow('    Town / City / District', (address.city || '---').toUpperCase(), 18);
  drawFieldRow('    State / Union Territory', (address.state || '---').toUpperCase(), 18);
  drawFieldRow('    Pincode / Postal Zip Code', String(address.pincode || '------'), 18);
  drawFieldRow('    Country Name', 'INDIA [X]', 18);

  // Row 8: Communication Address
  drawFieldRow('8. Address for Communication', 'RESIDENCE [X]      OFFICE [ ]', 20);

  // Row 9: Telephone & Email
  const mobile = personal.mobile || data.appliedBy || '---';
  const email = personal.email || '---';
  drawFieldRow('9. Telephone / Mobile & Email', `ISD: +91  |  Mobile: ${mobile}  |  Email: ${email}`, 22);

  // Row 10: Status
  drawFieldRow('10. Status of Applicant', 'INDIVIDUAL [X]', 20);

  // Row 11: Aadhaar Details
  const cleanAadhaar = String(identity.aadhaarNumber || '').replace(/\D/g, '');
  const maskedAadhaar = cleanAadhaar.length === 12
    ? `${cleanAadhaar.slice(0, 4)} ${cleanAadhaar.slice(4, 8)} ${cleanAadhaar.slice(8, 12)}`
    : cleanAadhaar || '------------';
  drawFieldRow('12. In case of person required to quote Aadhaar', `Aadhaar No: ${maskedAadhaar}`, 22);
  drawFieldRow('    Name as per Aadhaar Card', (identity.nameOnAadhaar || applicantFullName).toUpperCase(), 20);

  // Bottom Page 1 Footer Note
  page1.drawText(`Page 1 of 2  •  Application ID: ${data.id || 'PAN-NEW'}  •  Smart Cafe Cyber Portal (smartcafe.sbs)`, {
    x: tableX,
    y: 26,
    size: 7,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4)
  });


  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2: FORM NO. 49A (Declaration & Verification Page)
  // ═══════════════════════════════════════════════════════════════════════════
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  attachSafeDrawText(page2);

  // Page 2 Border
  page2.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderWidth: 1.2,
    borderColor: borderColor,
    color: rgb(1, 1, 1)
  });

  // Top Header Banner
  page2.drawRectangle({
    x: 20,
    y: height - 60,
    width: width - 40,
    height: 38,
    color: rgb(0.95, 0.96, 0.98),
    borderWidth: 0.8,
    borderColor: borderColor
  });

  page2.drawText('FORM NO. 49A (Page 2) — Income Tax Department', {
    x: width / 2 - 140,
    y: height - 38,
    size: 11,
    font: fontBold,
    color: primaryColor
  });

  page2.drawText('Documents Submitted, Source of Income & Legal Declaration', {
    x: width / 2 - 120,
    y: height - 52,
    size: 8,
    font: fontRegular,
    color: darkTextColor
  });

  let cursorY2 = height - 90;

  function drawFieldRow2(label, value, rowHeight = 26, isHeader = false) {
    page2.drawRectangle({
      x: tableX,
      y: cursorY2 - rowHeight,
      width: tableW,
      height: rowHeight,
      borderWidth: 0.6,
      borderColor: borderColor,
      color: isHeader ? rgb(0.93, 0.95, 0.98) : rgb(1, 1, 1)
    });

    page2.drawText(label, {
      x: tableX + 8,
      y: cursorY2 - rowHeight + 8,
      size: 8,
      font: isHeader ? fontBold : fontRegular,
      color: isHeader ? primaryColor : darkTextColor
    });

    if (value) {
      page2.drawText(String(value).slice(0, 80), {
        x: tableX + 210,
        y: cursorY2 - rowHeight + 8,
        size: 8,
        font: fontBold,
        color: darkTextColor
      });
    }

    cursorY2 -= rowHeight;
  }

  // Row 13: Source of Income
  drawFieldRow2('13. Source of Income', 'INCOME FROM OTHER SOURCES [X]   /   SALARY [ ]', 26);

  // Row 14: Representative Assessee
  drawFieldRow2('14. Representative Assessee', 'NOT APPLICABLE (Adult Applicant)', 26);

  // Row 15: Documents Submitted
  drawFieldRow2('15. Proof of Identity (POI) Submitted', 'AADHAAR CARD ISSUED BY UIDAI [X]', 26);
  drawFieldRow2('    Proof of Address (POA) Submitted', 'AADHAAR CARD ISSUED BY UIDAI [X]', 26);
  const dobProofName = (identity.dobProof || 'Municipal Birth Certificate').toUpperCase();
  drawFieldRow2('    Proof of Date of Birth (POB) Submitted', `${dobProofName} [X]`, 26);

  cursorY2 -= 15;

  // Row 16: Legal Declaration Section
  const declBoxH = 180;
  page2.drawRectangle({
    x: tableX,
    y: cursorY2 - declBoxH,
    width: tableW,
    height: declBoxH,
    borderWidth: 1,
    borderColor: borderColor,
    color: lightBg
  });

  page2.drawText('16. DECLARATION (Under Section 139A of the Income Tax Act, 1961)', {
    x: tableX + 10,
    y: cursorY2 - 20,
    size: 9,
    font: fontBold,
    color: primaryColor
  });

  const declText = `I/We, ${applicantFullName || 'THE APPLICANT'}, the applicant, in the capacity of HIMSELF / HERSELF, do hereby declare that what is stated above is true to the best of my/our information and belief. I undertake to inform any changes in above details to Income Tax Dept immediately.`;
  page2.drawText(declText, {
    x: tableX + 10,
    y: cursorY2 - 42,
    size: 8,
    font: fontRegular,
    color: darkTextColor,
    maxWidth: tableW - 20,
    lineHeight: 14
  });

  // Place & Date
  const todayFormatted = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
  const placeCity = (address.city || 'BULANDSHAHAR').toUpperCase();

  page2.drawText(`Place:  ${placeCity}`, {
    x: tableX + 14,
    y: cursorY2 - 110,
    size: 8.5,
    font: fontBold,
    color: darkTextColor
  });

  page2.drawText(`Date:   ${todayFormatted}`, {
    x: tableX + 14,
    y: cursorY2 - 130,
    size: 8.5,
    font: fontBold,
    color: darkTextColor
  });

  // Declaration Signature Box on Page 2
  const declSignBoxX = tableX + tableW - 190;
  const declSignBoxY = cursorY2 - declBoxH + 18;
  const declSignBoxW = 175;
  const declSignBoxH = 75;

  page2.drawRectangle({
    x: declSignBoxX,
    y: declSignBoxY,
    width: declSignBoxW,
    height: declSignBoxH,
    borderWidth: 1.2,
    borderColor: borderColor,
    color: rgb(1, 1, 1)
  });

  page2.drawText('Signature / Left Thumb Impression of Applicant', {
    x: declSignBoxX + 6,
    y: declSignBoxY + 5,
    size: 6.5,
    font: fontBold,
    color: rgb(0.4, 0.4, 0.4)
  });

  if (embeddedSign) {
    // Strictly centered inside Page 2 declaration signature box
    const signW = 120;
    const signH = 46;
    page2.drawImage(embeddedSign, {
      x: declSignBoxX + (declSignBoxW - signW) / 2,
      y: declSignBoxY + (declSignBoxH - signH) / 2 + 6,
      width: signW,
      height: signH
    });
  }

  // Verification Seal
  page2.drawRectangle({
    x: tableX,
    y: cursorY2 - declBoxH - 80,
    width: tableW,
    height: 65,
    borderWidth: 0.8,
    borderColor: borderColor,
    color: rgb(0.97, 0.98, 1)
  });

  page2.drawText('OFFICIAL SMART CAFE DIGITALLY VERIFIED STAMP & SUBMISSION RECORD', {
    x: tableX + 10,
    y: cursorY2 - declBoxH - 26,
    size: 8,
    font: fontBold,
    color: primaryColor
  });

  page2.drawText(`Application ID: ${data.id || 'PAN-NEW'}  |  AO Code: ${aoCode.areaCode || ''} ${aoCode.aoType || ''} ${aoCode.rangeCode || ''} ${aoCode.aoNumber || ''}`, {
    x: tableX + 10,
    y: cursorY2 - declBoxH - 42,
    size: 7.5,
    font: fontRegular,
    color: darkTextColor
  });

  page2.drawText(`Base Gateway: PanSuvidha (UTIITSL / Protean NSDL)  |  Security Hash Verified  |  Auto-Stamping Engine v2.0`, {
    x: tableX + 10,
    y: cursorY2 - declBoxH - 58,
    size: 7,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3)
  });

  // Page 2 Footer Note
  page2.drawText(`Page 2 of 2  •  Application ID: ${data.id || 'PAN-NEW'}  •  Smart Cafe Cyber Portal (smartcafe.sbs)`, {
    x: tableX,
    y: 26,
    size: 7,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4)
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MERGE ATTACHED DOCUMENTS (Aadhaar & DOB Proof) INTO SINGLE <2MB PDF
  // ═══════════════════════════════════════════════════════════════════════════
  async function appendAttachment(docInput, docTitle) {
    if (!docInput) return;
    const docBytes = await toBytes(docInput);
    if (!docBytes || docBytes.length === 0) return;

    // Check if attachment is a PDF
    const isPdf = docBytes[0] === 0x25 && docBytes[1] === 0x50 && docBytes[2] === 0x44 && docBytes[3] === 0x46; // %PDF

    if (isPdf) {
      try {
        const extDoc = await PDFDocument.load(docBytes, { ignoreEncryption: true });
        const copiedPages = await pdfDoc.copyPages(extDoc, extDoc.getPageIndices());
        copiedPages.forEach(p => pdfDoc.addPage(p));
        return;
      } catch (err) {
        console.warn(`[form49aStamper] Failed to merge PDF attachment (${docTitle}):`, err.message);
      }
    }

    // Attachment is an Image (JPG/PNG)
    try {
      const extImg = await embedImage(pdfDoc, docBytes);
      if (extImg) {
        const attPage = pdfDoc.addPage([595.28, 841.89]);
        attachSafeDrawText(attPage);
        const pSize = attPage.getSize();

        // Title Header
        attPage.drawRectangle({
          x: 20,
          y: pSize.height - 45,
          width: pSize.width - 40,
          height: 28,
          color: rgb(0.94, 0.96, 0.99),
          borderWidth: 0.6,
          borderColor: borderColor
        });

        attPage.drawText(`ATTACHED PROOF: ${docTitle.toUpperCase()}`, {
          x: 30,
          y: pSize.height - 35,
          size: 9,
          font: fontBold,
          color: primaryColor
        });

        // Compute aspect-fit dimensions
        const maxW = pSize.width - 60;
        const maxH = pSize.height - 90;
        const imgAspect = extImg.width / extImg.height;
        let drawW = maxW;
        let drawH = drawW / imgAspect;

        if (drawH > maxH) {
          drawH = maxH;
          drawW = drawH * imgAspect;
        }

        attPage.drawImage(extImg, {
          x: (pSize.width - drawW) / 2,
          y: (pSize.height - 50 - drawH) / 2 + 10,
          width: drawW,
          height: drawH
        });
      }
    } catch (err) {
      console.warn(`[form49aStamper] Failed to embed image attachment (${docTitle}):`, err.message);
    }
  }

  // Append Aadhaar Document
  const aadhaarDocInput = documents.aadhaarDoc || data.aadhaarDoc;
  if (aadhaarDocInput) {
    await appendAttachment(aadhaarDocInput, 'Aadhaar Card (Proof of Identity & Address)');
  }

  // Append DOB Proof Document
  const dobDocInput = documents.dobDoc || data.dobDoc;
  if (dobDocInput) {
    await appendAttachment(dobDocInput, `Date of Birth Proof (${identity.dobProof || 'Birth Certificate'})`);
  }

  // Save Final PDF Bytes
  const pdfBytes = await pdfDoc.save();

  // Create Blob and Data URL for instant preview / download in browser
  let blob = null;
  let dataUrl = '';
  if (typeof Blob !== 'undefined') {
    blob = new Blob([pdfBytes], { type: 'application/pdf' });
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      dataUrl = URL.createObjectURL(blob);
    }
  } else if (typeof Buffer !== 'undefined') {
    const base64 = Buffer.from(pdfBytes).toString('base64');
    dataUrl = `data:application/pdf;base64,${base64}`;
  }

  return {
    pdfBytes,
    blob,
    dataUrl
  };
}

export default {
  generateStampedForm49APdf
};
