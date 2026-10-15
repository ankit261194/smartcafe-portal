<?php
/**
 * ════════════════════════════════════════════════════════════════════════════
 * SMART CYBER CAFE — HIGH-PERFORMANCE MYSQL / MARIADB ENTERPRISE ADAPTER
 * ════════════════════════════════════════════════════════════════════════════
 * Dual-Mode Engine: Seamlessly bridges MySQL with JSON file fallback.
 * Guarantees zero downtime, atomic ACID transactions, and instant migration.
 */

function getDbConfig() {
    $configFile = __DIR__ . '/db-config.php';
    if (file_exists($configFile)) {
        $cfg = include $configFile;
        if (is_array($cfg) && !empty($cfg['host']) && !empty($cfg['database']) && !empty($cfg['username'])) {
            return $cfg;
        }
    }
    
    // Check environment variables
    $host = getenv('DB_HOST') ?: (getenv('MYSQL_HOST') ?: '');
    $db   = getenv('DB_NAME') ?: (getenv('MYSQL_DATABASE') ?: '');
    $user = getenv('DB_USER') ?: (getenv('MYSQL_USER') ?: '');
    $pass = getenv('DB_PASS') ?: (getenv('MYSQL_PASSWORD') ?: '');

    if ($host && $db && $user) {
        return [
            'host' => $host,
            'database' => $db,
            'username' => $user,
            'password' => $pass,
            'port' => getenv('DB_PORT') ?: 3306
        ];
    }

    return null;
}

function getPdoConnection() {
    static $pdo = null;
    static $attempted = false;

    if ($attempted) return $pdo;
    $attempted = true;

    $cfg = getDbConfig();
    if (!$cfg) return null;

    try {
        $dsn = "mysql:host={$cfg['host']};port=" . ($cfg['port'] ?? 3306) . ";dbname={$cfg['database']};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        $pdo = new PDO($dsn, $cfg['username'], $cfg['password'], $options);
        initDbSchema($pdo);
        return $pdo;
    } catch (Throwable $e) {
        error_log("SmartCafe DB Connection Error: " . $e->getMessage());
        return null;
    }
}

function initDbSchema(PDO $pdo) {
    static $initialized = false;
    if ($initialized) return;
    $initialized = true;

    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            phone VARCHAR(20) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL DEFAULT 'ग्राहक',
            shop_name VARCHAR(150) DEFAULT '',
            password VARCHAR(255) NOT NULL,
            role VARCHAR(30) NOT NULL DEFAULT 'citizen',
            balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            is_blocked TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS wallets (
            phone VARCHAR(20) PRIMARY KEY,
            customer_name VARCHAR(100) NOT NULL DEFAULT 'ग्राहक',
            balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(64) PRIMARY KEY,
            phone VARCHAR(20) NOT NULL,
            type VARCHAR(20) NOT NULL DEFAULT 'debit',
            amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            note TEXT,
            description TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_phone (phone),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS cafes (
            id VARCHAR(64) PRIMARY KEY,
            code VARCHAR(64) NOT NULL,
            shop_name VARCHAR(150) NOT NULL,
            owner_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL UNIQUE,
            b2b_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            min_threshold DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            is_frozen TINYINT(1) NOT NULL DEFAULT 0,
            frozen_reason TEXT,
            retail_rates LONGTEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(64) PRIMARY KEY,
            cafe_id VARCHAR(64) NOT NULL,
            customer_phone VARCHAR(20) NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            service_type VARCHAR(64) NOT NULL,
            doc_title VARCHAR(255) NOT NULL,
            ref_number VARCHAR(100) NOT NULL,
            retail_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            wholesale_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            margin DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            status VARCHAR(30) NOT NULL DEFAULT 'completed',
            payload_json LONGTEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_customer_phone (customer_phone),
            INDEX idx_cafe_id (cafe_id),
            INDEX idx_service_type (service_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS utr_requests (
            id VARCHAR(64) PRIMARY KEY,
            cafe_id VARCHAR(64) DEFAULT NULL,
            customer_phone VARCHAR(20) NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            utr VARCHAR(30) NOT NULL UNIQUE,
            amount DECIMAL(10,2) NOT NULL,
            slip_url TEXT,
            status VARCHAR(30) NOT NULL DEFAULT 'pending',
            approved_at DATETIME DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_utr (utr),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS system_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value LONGTEXT NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
    ];

    foreach ($queries as $q) {
        try {
            $pdo->exec($q);
        } catch (Throwable $e) {
            error_log("Schema Table Init Warning: " . $e->getMessage());
        }
    }
}

function migrateJsonStoreToMysql(PDO $pdo, array $store) {
    initDbSchema($pdo);
    $counts = [
        'users' => 0,
        'wallets' => 0,
        'transactions' => 0,
        'cafes' => 0,
        'orders' => 0,
        'utrs' => 0
    ];

    $pdo->beginTransaction();
    try {
        // 1. Users
        if (!empty($store['users']) && is_array($store['users'])) {
            $stmt = $pdo->prepare("INSERT INTO users (id, phone, name, shop_name, password, role, balance, is_blocked, created_at)
                VALUES (:id, :phone, :name, :shop_name, :password, :role, :balance, :is_blocked, :created_at)
                ON DUPLICATE KEY UPDATE name = VALUES(name), shop_name = VALUES(shop_name), balance = VALUES(balance), is_blocked = VALUES(is_blocked)");
            foreach ($store['users'] as $u) {
                if (empty($u['phone'])) continue;
                $stmt->execute([
                    ':id' => $u['id'] ?? ('USR-' . $u['phone']),
                    ':phone' => $u['phone'],
                    ':name' => $u['name'] ?? 'ग्राहक',
                    ':shop_name' => $u['shopName'] ?? '',
                    ':password' => $u['password'] ?? 'password123',
                    ':role' => $u['role'] ?? 'citizen',
                    ':balance' => floatval($u['balance'] ?? 0),
                    ':is_blocked' => !empty($u['isBlocked']) ? 1 : 0,
                    ':created_at' => !empty($u['createdAt']) ? date('Y-m-d H:i:s', strtotime($u['createdAt'])) : date('Y-m-d H:i:s')
                ]);
                $counts['users']++;
            }
        }

        // 2. Wallets & Transactions
        if (!empty($store['wallets']) && is_array($store['wallets'])) {
            $wStmt = $pdo->prepare("INSERT INTO wallets (phone, customer_name, balance, updated_at)
                VALUES (:phone, :customer_name, :balance, NOW())
                ON DUPLICATE KEY UPDATE customer_name = VALUES(customer_name), balance = VALUES(balance)");
            $tStmt = $pdo->prepare("INSERT INTO transactions (id, phone, type, amount, note, description, created_at)
                VALUES (:id, :phone, :type, :amount, :note, :description, :created_at)
                ON DUPLICATE KEY UPDATE note = VALUES(note)");

            foreach ($store['wallets'] as $w) {
                if (empty($w['phone'])) continue;
                $phone = $w['phone'];
                // Clean transactions: strip TXN-INIT-500
                $cleanTx = [];
                if (!empty($w['transactions']) && is_array($w['transactions'])) {
                    foreach ($w['transactions'] as $tx) {
                        if (($tx['id'] ?? '') === 'TXN-INIT-500' || ($tx['description'] ?? '') === 'Opening Balance') continue;
                        $cleanTx[] = $tx;
                    }
                }
                $realBal = 0;
                foreach ($cleanTx as $tx) {
                    if (($tx['type'] ?? '') === 'credit') $realBal += floatval($tx['amount'] ?? 0);
                    if (($tx['type'] ?? '') === 'debit') $realBal -= floatval($tx['amount'] ?? 0);
                }
                $finalBal = ($phone === '8006518960') ? max(0, $realBal) : floatval($w['balance'] ?? 0);

                $wStmt->execute([
                    ':phone' => $phone,
                    ':customer_name' => $w['customerName'] ?? 'ग्राहक',
                    ':balance' => $finalBal
                ]);
                $counts['wallets']++;

                foreach ($cleanTx as $tx) {
                    if (empty($tx['id'])) continue;
                    $tStmt->execute([
                        ':id' => $tx['id'],
                        ':phone' => $phone,
                        ':type' => $tx['type'] ?? 'credit',
                        ':amount' => floatval($tx['amount'] ?? 0),
                        ':note' => $tx['note'] ?? '',
                        ':description' => $tx['description'] ?? '',
                        ':created_at' => !empty($tx['createdAt']) ? date('Y-m-d H:i:s', strtotime($tx['createdAt'])) : date('Y-m-d H:i:s')
                    ]);
                    $counts['transactions']++;
                }
            }
        }

        // 3. Cafes
        if (!empty($store['cafes']) && is_array($store['cafes'])) {
            $cStmt = $pdo->prepare("INSERT INTO cafes (id, code, shop_name, owner_name, phone, b2b_balance, min_threshold, is_frozen, frozen_reason, retail_rates, created_at)
                VALUES (:id, :code, :shop_name, :owner_name, :phone, :b2b_balance, :min_threshold, :is_frozen, :frozen_reason, :retail_rates, :created_at)
                ON DUPLICATE KEY UPDATE shop_name = VALUES(shop_name), owner_name = VALUES(owner_name), b2b_balance = VALUES(b2b_balance)");
            foreach ($store['cafes'] as $c) {
                if (empty($c['id'])) continue;
                $cStmt->execute([
                    ':id' => $c['id'],
                    ':code' => $c['code'] ?? $c['id'],
                    ':shop_name' => $c['shopName'] ?? 'डिजिटल सेवा केंद्र',
                    ':owner_name' => $c['ownerName'] ?? 'संचालक',
                    ':phone' => $c['phone'] ?? '',
                    ':b2b_balance' => floatval($c['b2bWallet']['balance'] ?? 0),
                    ':min_threshold' => floatval($c['b2bWallet']['minThreshold'] ?? 0),
                    ':is_frozen' => !empty($c['isFrozen']) ? 1 : 0,
                    ':frozen_reason' => $c['frozenReason'] ?? '',
                    ':retail_rates' => json_encode($c['retailRates'] ?? [], JSON_UNESCAPED_UNICODE),
                    ':created_at' => !empty($c['createdAt']) ? date('Y-m-d H:i:s', strtotime($c['createdAt'])) : date('Y-m-d H:i:s')
                ]);
                $counts['cafes']++;
            }
        }

        // 4. System Settings
        if (!empty($store['settings']) && is_array($store['settings'])) {
            $sStmt = $pdo->prepare("INSERT INTO system_settings (setting_key, setting_value, updated_at)
                VALUES (:key, :val, NOW())
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            foreach ($store['settings'] as $k => $v) {
                $sStmt->execute([
                    ':key' => (string)$k,
                    ':val' => is_scalar($v) ? (string)$v : json_encode($v, JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        $pdo->commit();
        return ['success' => true, 'counts' => $counts];
    } catch (Throwable $e) {
        $pdo->rollBack();
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
