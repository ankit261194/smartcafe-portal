const fs = require('fs');

let p = fs.readFileSync('client/public/api/index.php', 'utf8');

const helperPhp = `
// ═══════════════════════════════════════════════════════════════════════════
// Live P4Points B2B Gateway Dispatcher (PHP Bridge)
// ═══════════════════════════════════════════════════════════════════════════
function dispatchLiveP4Points($serviceType, $params, $p4ApiKey) {
    if (!$p4ApiKey) return null;
    $norm = strtolower((string)$serviceType);

    // 1. RC Services
    if (strpos($norm, 'rc') !== false || $norm === 'rcdownload' || strpos($norm, 'vehicle') !== false || strpos($norm, 'chassis') !== false || strpos($norm, 'engine') !== false) {
        $regNo = strtoupper(preg_replace('/[\\s-]+/', '', $params['vehicleNumber'] ?? ($params['rcNo'] ?? ($params['regNo'] ?? ($params['query'] ?? '')))));
        if (strlen($regNo) >= 4) {
            $url = 'https://authorized.p4points.co.in/serviceApi/TargetApiV1/RC/rc-details.php?apiKey=' . urlencode($p4ApiKey) . '&rcno=' . urlencode($regNo);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $resp = curl_exec($ch);
            curl_close($ch);
            if ($resp) {
                $json = json_decode($resp, true);
                if (!empty($json['success']) && !empty($json['data'])) {
                    $p4 = $json['data'];
                    return [
                        'source' => 'p4points',
                        'service' => 'rc',
                        'regNo' => $p4['rc_number'] ?? $regNo,
                        'ownerName' => $p4['owner_name'] ?? 'वाहन स्वामी',
                        'fatherName' => $p4['father_name'] ?? '',
                        'presentAddress' => $p4['present_address'] ?? '',
                        'permanentAddress' => $p4['permanent_address'] ?? '',
                        'address' => $p4['present_address'] ?? ($p4['permanent_address'] ?? ''),
                        'mobileNumber' => $p4['mobile_number'] ?? '',
                        'vehicleCategory' => $p4['vehicle_category'] ?? 'LMV',
                        'chassisNo' => $p4['vehicle_chasi_number'] ?? '',
                        'engineNo' => $p4['vehicle_engine_number'] ?? '',
                        'maker' => $p4['maker_description'] ?? '',
                        'model' => $p4['maker_model'] ?? '',
                        'makerModel' => trim(($p4['maker_description'] ?? '') . ' ' . ($p4['maker_model'] ?? '')) ?: 'मोटर वाहन',
                        'fuelType' => $p4['fuel_type'] ?? 'PETROL',
                        'vehicleColor' => $p4['color'] ?? 'WHITE',
                        'regDate' => $p4['registration_date'] ?? '',
                        'manufacturingDate' => $p4['manufacturing_date'] ?? '',
                        'fitnessUpto' => $p4['fit_up_to'] ?? '',
                        'financer' => $p4['financer'] ?? (!empty($p4['financed']) ? 'FINANCED' : 'NO HYPOTHECATION'),
                        'financed' => !empty($p4['financed']),
                        'insuranceCompany' => $p4['insurance_company'] ?? '',
                        'insurancePolicyNo' => $p4['insurance_policy_number'] ?? '',
                        'insuranceUpto' => $p4['insurance_upto'] ?? '',
                        'issuingRto' => $p4['registered_at'] ?? 'परिवहन कार्यालय',
                        'taxUpto' => $p4['tax_upto'] ?? ($p4['tax_paid_upto'] ?? ''),
                        'cubicCapacity' => $p4['cubic_capacity'] ?? '',
                        'grossWeight' => $p4['vehicle_gross_weight'] ?? '',
                        'unladenWeight' => $p4['unladen_weight'] ?? '',
                        'seatingCapacity' => $p4['seat_capacity'] ?? '',
                        'puccUpto' => $p4['pucc_upto'] ?? '',
                        'puccNo' => $p4['pucc_number'] ?? '',
                        'rcStatus' => $p4['rc_status'] ?? 'ACTIVE',
                        'stateName' => $p4['statename'] ?? 'भारत सरकार (परिवहन विभाग)',
                        'applicationNo' => $json['application_no'] ?? ('P4P-' . time()),
                        'isLiveFromP4Points' => true
                    ];
                }
            }
        }
    }

    // 2. Aadhaar to PAN / UID to PAN
    if (strpos($norm, 'aadhaartopan') !== false || strpos($norm, 'uidtopan') !== false || strpos($norm, 'panfind') !== false || strpos($norm, 'aadhaar_to_pan') !== false) {
        $uid = preg_replace('/[^0-9]/', '', $params['aadhaarNo'] ?? ($params['uidNumber'] ?? ($params['query'] ?? '')));
        if (strlen($uid) === 12) {
            $url = 'https://authorized.p4points.co.in/api/v1/getPanNumber.php?apiKey=' . urlencode($p4ApiKey) . '&uidNumber=' . urlencode($uid);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 12);
            $resp = curl_exec($ch);
            curl_close($ch);
            if ($resp) {
                $json = json_decode($resp, true);
                if (!empty($json['status']) && $json['status'] == 200 && !empty($json['pan_number'])) {
                    return [
                        'source' => 'p4points',
                        'service' => 'aadhaarToPan',
                        'panNo' => $json['pan_number'],
                        'maskedAadhaar' => 'XXXX XXXX ' . substr($uid, -4),
                        'aadhaarNo' => $uid,
                        'name' => $json['name'] ?? ($params['name'] ?? 'PAN धारक'),
                        'isLiveFromP4Points' => true
                    ];
                }
            }
        }
    }

    // 3. PAN Verification & Details
    if (strpos($norm, 'pan') !== false && strpos($norm, 'find') === false && strpos($norm, 'aadhaar') === false) {
        $panNo = strtoupper(trim($params['panNo'] ?? ($params['pan'] ?? ($params['query'] ?? ''))));
        if (preg_match('/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/', $panNo)) {
            $url = 'https://authorized.p4points.co.in/api/v1/panVerificationPremium.php?apiKey=' . urlencode($p4ApiKey) . '&panNumber=' . urlencode($panNo);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $resp = curl_exec($ch);
            curl_close($ch);
            if ($resp) {
                $json = json_decode($resp, true);
                if (!empty($json['status']) && $json['status'] === 'success' && !empty($json['data'])) {
                    return [
                        'source' => 'p4points',
                        'service' => 'panCard',
                        'panNo' => $panNo,
                        'name' => $json['data']['full_name'] ?? ($json['data']['name'] ?? 'PAN धारक'),
                        'fatherName' => $json['data']['father_name'] ?? '',
                        'dob' => $json['data']['dob'] ?? '',
                        'category' => $json['data']['category'] ?? 'Individual',
                        'gender' => $json['data']['gender'] ?? 'M',
                        'aadhaarSeedingStatus' => $json['data']['aadhaar_seeding_status'] ?? 'Linked',
                        'isLiveFromP4Points' => true
                    ];
                }
            }
        }
    }

    // 4. DL PDF / Driving Licence
    if (strpos($norm, 'dl') !== false || strpos($norm, 'licence') !== false || strpos($norm, 'driving') !== false) {
        $dlNo = strtoupper(trim($params['dlNo'] ?? ($params['query'] ?? '')));
        $dob = $params['dob'] ?? '01-01-1990';
        if (strlen($dlNo) >= 6) {
            $url = 'https://authorized.p4points.co.in/api/v1/dlpdf.php?apiKey=' . urlencode($p4ApiKey) . '&dlNo=' . urlencode($dlNo) . '&dob=' . urlencode($dob);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $resp = curl_exec($ch);
            curl_close($ch);
            if ($resp) {
                $json = json_decode($resp, true);
                if (!empty($json['status']) && $json['status'] == 200 && !empty($json['pdf_url'])) {
                    return [
                        'source' => 'p4points',
                        'service' => 'dl',
                        'dlNo' => $dlNo,
                        'pdfUrl' => $json['pdf_url'],
                        'isLiveFromP4Points' => true
                    ];
                }
            }
        }
    }

    // 5. Ration PDF
    if (strpos($norm, 'ration') !== false) {
        $rationNo = preg_replace('/[^0-9]/', '', $params['rationNo'] ?? ($params['query'] ?? ''));
        if (strlen($rationNo) >= 6) {
            $url = 'https://authorized.p4points.co.in/api/v1/rationPdf.php?apiKey=' . urlencode($p4ApiKey) . '&ration_no=' . urlencode($rationNo) . '&rationtype=NFSA';
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $resp = curl_exec($ch);
            curl_close($ch);
            if ($resp) {
                $json = json_decode($resp, true);
                if (!empty($json['status']) && $json['status'] == 1 && !empty($json['pdf_url'])) {
                    return [
                        'source' => 'p4points',
                        'service' => 'ration',
                        'rationNo' => $rationNo,
                        'pdfUrl' => $json['pdf_url'],
                        'isLiveFromP4Points' => true
                    ];
                }
            }
        }
    }

    return null;
}
`;

if (!p.includes('function dispatchLiveP4Points')) {
  p = p.replace('// ROUTE: /api/services/execute-automated', helperPhp + "\n// ROUTE: /api/services/execute-automated");
}

// Add topup-instant route
const topupInstantRoute = `
// Route: /api/wallet/topup-instant (Instant top-up for fast test recharge)
if ($endpoint === 'wallet/topup-instant' && $method === 'POST') {
    $phone = trim($body['phone'] ?? '');
    $amount = floatval($body['amount'] ?? 500);
    if ($amount <= 0) $amount = 500;
    if (!$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'मोबाइल नंबर आवश्यक है।']);
        exit;
    }
    if (!isset($store['wallets'])) $store['wallets'] = [];
    $found = false;
    $walletData = null;
    foreach ($store['wallets'] as &$w) {
        if ($w['phone'] === $phone) {
            $w['balance'] = (floatval($w['balance'] ?? 0)) + $amount;
            if (!isset($w['transactions'])) $w['transactions'] = [];
            array_unshift($w['transactions'], [
                'id' => 'TXN-INSTANT-' . time(),
                'amount' => $amount,
                'type' => 'credit',
                'note' => 'त्वरित 1-क्लिक वॉलेट टॉप-अप (Instant Top-up)',
                'date' => date('c')
            ]);
            $walletData = $w;
            $found = true;
            break;
        }
    }
    unset($w);
    if (!$found) {
        $walletData = [
            'phone' => $phone,
            'customerName' => 'सत्यापित उपभोक्ता',
            'balance' => $amount,
            'transactions' => [[
                'id' => 'TXN-INSTANT-' . time(),
                'amount' => $amount,
                'type' => 'credit',
                'note' => 'त्वरित 1-क्लिक वॉलेट टॉप-अप (Instant Top-up)',
                'date' => date('c')
            ]]
        ];
        $store['wallets'][] = $walletData;
    }
    saveStore($store);
    echo json_encode(['success' => true, 'balance' => $walletData['balance'], 'wallet' => $walletData]);
    exit;
}
`;

if (!p.includes("wallet/topup-instant")) {
  p = p.replace("// Route: /api/wallet/submit-utr", topupInstantRoute + "\n// Route: /api/wallet/submit-utr");
}

// Add live P4Points execution in execute-automated
const oldPhpDispatchMarker = "$generatedData = null;\n    $vehicleData = null;";
const newPhpDispatchMarker = `$p4ApiKey = $store['apiGateway']['apiKey'] ?? 'f1c563aa08c301c9a7e58796ed4edbced254ea3a674f76fca2bbb1a2429968c5';
    $liveP4 = null;
    if ($p4ApiKey && (!isset($store['apiGateway']['liveMode']) || $store['apiGateway']['liveMode'])) {
        $liveP4 = dispatchLiveP4Points($normServiceType, $params, $p4ApiKey);
    }
    $generatedData = null;
    $vehicleData = null;`;

if (p.includes(oldPhpDispatchMarker) && !p.includes('$liveP4 = null;')) {
  p = p.replace(oldPhpDispatchMarker, newPhpDispatchMarker);
}

// Update RC handling in PHP
const oldPhpRcBlock = `    if ($normServiceType === 'rcDownload') {
        $regNo = strtoupper(preg_replace('/[\\s-]+/', '', $params['vehicleNumber'] ?? ''));
        $vehicleData = getVehicleDetails($regNo, $params);
        $generatedData = $vehicleData;`;

const newPhpRcBlock = `    if ($normServiceType === 'rcDownload' || (!empty($liveP4) && ($liveP4['service'] ?? '') === 'rc')) {
        $regNo = strtoupper(preg_replace('/[\\s-]+/', '', $params['vehicleNumber'] ?? ($liveP4['regNo'] ?? ($params['query'] ?? ''))));
        if (!empty($liveP4) && ($liveP4['service'] ?? '') === 'rc') {
            $vehicleData = array_merge(getVehicleDetails($liveP4['regNo'] ?? $regNo, $params), $liveP4);
            $vehicleData['regNo'] = $liveP4['regNo'] ?? $regNo;
        } else {
            $vehicleData = getVehicleDetails($regNo, $params);
        }
        $generatedData = $vehicleData;`;

if (p.includes(oldPhpRcBlock)) {
  p = p.replace(oldPhpRcBlock, newPhpRcBlock);
}

// Update PAN handling in PHP
const oldPhpPanBlock = `    } elseif ($normServiceType === 'panCard') {
        $generatedData = getPanCardDetails($params['panNo'] ?? '', $params);`;

const newPhpPanBlock = `    } elseif ($normServiceType === 'panCard' || (!empty($liveP4) && ($liveP4['service'] ?? '') === 'panCard')) {
        if (!empty($liveP4) && ($liveP4['service'] ?? '') === 'panCard') {
            $generatedData = array_merge(getPanCardDetails($liveP4['panNo'] ?? ($params['panNo'] ?? ''), $params), $liveP4);
        } else {
            $generatedData = getPanCardDetails($params['panNo'] ?? '', $params);
        }`;

if (p.includes(oldPhpPanBlock)) {
  p = p.replace(oldPhpPanBlock, newPhpPanBlock);
}

// Update Aadhaar to PAN in PHP
const oldPhpAadhaarBlock = `    } elseif ($normServiceType === 'aadhaarCard') {`;
const newPhpAadhaarBlock = `    } elseif (!empty($liveP4) && ($liveP4['service'] ?? '') === 'aadhaarToPan') {
        $generatedData = array_merge(getPanCardDetails($liveP4['panNo'], $params), $liveP4);
        $docTitle = "आधार से पैन खोज (" . $liveP4['panNo'] . ")";
        $refNumber = $liveP4['panNo'];
    } elseif ($normServiceType === 'aadhaarCard') {`;

if (p.includes(oldPhpAadhaarBlock) && !p.includes("aadhaarToPan")) {
  p = p.replace(oldPhpAadhaarBlock, newPhpAadhaarBlock);
}

fs.writeFileSync('client/public/api/index.php', p, 'utf8');
console.log('client/public/api/index.php patched successfully!');
