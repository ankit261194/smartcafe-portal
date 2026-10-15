const fs = require('fs');

let p = fs.readFileSync('client/public/api/index.php', 'utf8');

// 1. Fix saveStore($store) to saveStore($dataFile, $store)
p = p.replace('saveStore($store);', 'saveStore($dataFile, $store);');

// 2. Enhance cURL options with SSL bypass in dispatchLiveP4Points
p = p.replace(
  `            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $resp = curl_exec($ch);
            curl_close($ch);`,
  `            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            $resp = curl_exec($ch);
            curl_close($ch);`
);

// 3. Wrap dispatchLiveP4Points invocation in try-catch
p = p.replace(
  `    if ($p4ApiKey && (!isset($store['apiGateway']['liveMode']) || $store['apiGateway']['liveMode'])) {
        $liveP4 = dispatchLiveP4Points($normServiceType, $params, $p4ApiKey);
    }`,
  `    if ($p4ApiKey && (!isset($store['apiGateway']['liveMode']) || $store['apiGateway']['liveMode'])) {
        try {
            $liveP4 = dispatchLiveP4Points($normServiceType, $params, $p4ApiKey);
        } catch (Throwable $e) {
            $liveP4 = null;
        }
    }`
);

fs.writeFileSync('client/public/api/index.php', p, 'utf8');
console.log('client/public/api/index.php fixed successfully!');
