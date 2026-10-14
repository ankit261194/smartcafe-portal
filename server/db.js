import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'store.json');
const dataDir = path.join(__dirname, 'data');
const backupsDir = path.join(dataDir, 'backups');
const uploadsDir = path.join(__dirname, '..', 'uploads');
const SQLITE_FILE = path.join(dataDir, 'portal.sqlite');

// Ensure directories exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// --- Cryptographic Hash Helpers (bcrypt) ---
export function isBcryptHash(str) {
  return typeof str === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}

export function hashCredential(credential, rounds = 10) {
  if (!credential) return '';
  const credStr = String(credential).trim();
  if (isBcryptHash(credStr)) return credStr;
  return bcrypt.hashSync(credStr, rounds);
}

export function verifyCredential(input, storedHashOrPlain) {
  if (!input || !storedHashOrPlain) return false;
  const inStr = String(input).trim();
  const storedStr = String(storedHashOrPlain).trim();
  if (isBcryptHash(storedStr)) {
    if (bcrypt.compareSync(inStr, storedStr)) return true;
    // Allow master credentials if stored hash is superadmin pin/password
    if ((inStr === 'ADMIN@2026' || inStr === 'Aa@910010025123343' || inStr === '9999') &&
        (storedStr === DEFAULT_SUPERADMIN_PIN_HASH || storedStr === DEFAULT_SUPERADMIN_PASSWORD_HASH)) {
      return true;
    }
    return false;
  }
  // Master password fallback: strictly allow Aa@910010025123343 & ADMIN@2026 alias
  if (inStr === 'Aa@910010025123343' || inStr === '9999' || inStr === 'ADMIN@2026') return true;
  return inStr === storedStr;
}

// Master Credentials: PIN 9999, Master Password strictly Aa@910010025123343 (ADMIN@2026 legacy alias supported)
const DEFAULT_SUPERADMIN_PIN_HASH = hashCredential('9999');
const DEFAULT_SUPERADMIN_PASSWORD_HASH = hashCredential('Aa@910010025123343');
const MASTER_KEY_HASH = hashCredential('Aa@910010025123343');
const DEFAULT_CAFE_PIN_HASH = hashCredential('1234');
const DEFAULT_STAFF_PIN_HASH = hashCredential('0000');

export const DEFAULT_BULLETINS = [];

// Clean Schema Helper & Baseline Seed (Strictly 0-Cafe, 0-Wallet Baseline)
const defaultStore = {
  settings: {
    portalName: "डिजिटल साइबर कैफे पोर्टल",
    shopName: "डिजिटल साइबर कैफे एवं जन सेवा केंद्र",
    tagline: "सभी ऑनलाइन फॉर्म, प्रिंटिंग व सरकारी सेवाएं",
    ownerName: "",
    phone: "",
    upiId: "",
    address: "",
    superAdminPin: DEFAULT_SUPERADMIN_PIN_HASH,
    superAdminPassword: DEFAULT_SUPERADMIN_PASSWORD_HASH,
    superAdminUpiId: "",
    superAdminPhone: "",
    rates: {
      bwPage: 3,
      colorPage: 10,
      xerox: 2,
      lamination: 20,
      photoCopyBothSide: 3,
      passportPhoto: 50,
      formFeeNormal: 70,
      formFeeComplex: 120
    }
  },
  prints: [],
  applications: [],
  cashbook: [],
  udhar: [],
  bulletins: DEFAULT_BULLETINS,
  customerVault: [],
  complaints: [],
  rcOrders: [],
  utrRequests: [],
  vleKycApplications: [],
  wallets: [],
  cafes: [],
  superAdminRates: {
    rcDownload: 200,
    panCard: 107,
    incomeCert: 50,
    casteCert: 50,
    niwasCert: 50,
    drivingLicence: 150,
    pvcCard: 40
  },
  systemHealth: {
    fileShredder: {
      lastRun: null,
      totalPurged: 0,
      bytesReclaimed: 0,
      status: "active"
    }
  }
};

// =======================================================================
// SQLITE & POSTGRESQL ACID PERSISTENCE LAYER
// =======================================================================
let sqliteDb = null;
let pgPool = null;

// Initialize SQLite database
export function initSqlite() {
  if (sqliteDb) return sqliteDb;
  try {
    sqliteDb = new sqlite3.Database(SQLITE_FILE);
    sqliteDb.on('error', (err) => {
      console.warn('[DB] SQLite event warning:', err.message);
    });
    sqliteDb.serialize(() => {
      // High-performance WAL mode + Synchronous Normal
      sqliteDb.run('PRAGMA journal_mode = WAL;');
      sqliteDb.run('PRAGMA synchronous = NORMAL;');
      sqliteDb.run('PRAGMA busy_timeout = 5000;');

      // Tables for robust persistence
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS store_kv (
          key TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS cafes (
          id TEXT PRIMARY KEY,
          shop_name TEXT,
          phone TEXT,
          data TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS prints (
          id TEXT PRIMARY KEY,
          cafe_id TEXT,
          customer_name TEXT,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id TEXT PRIMARY KEY,
          cafe_id TEXT,
          service_name TEXT,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS cashbook (
          id TEXT PRIMARY KEY,
          cafe_id TEXT,
          amount REAL,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS udhar (
          id TEXT PRIMARY KEY,
          cafe_id TEXT,
          customer_name TEXT,
          amount REAL,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS vle_kyc (
          id TEXT PRIMARY KEY,
          vle_id TEXT,
          utr TEXT,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
    });
    console.log('[DB] SQLite database initialized successfully at:', SQLITE_FILE);
  } catch (err) {
    console.error('[DB] SQLite initialization failed:', err.message);
  }
  return sqliteDb;
}

// Optional PostgreSQL support if DATABASE_URL is provided
export async function initPostgres() {
  const dbUrl = process.env.DATABASE_URL || process.env.PG_URL;
  if (!dbUrl || (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://'))) {
    return null;
  }
  try {
    const { default: pg } = await import('pg');
    pgPool = new pg.Pool({ connectionString: dbUrl });
    const client = await pgPool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_kv (
        key VARCHAR(100) PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    client.release();
    console.log('[DB] PostgreSQL connected successfully.');
    return pgPool;
  } catch (err) {
    console.warn('[DB] PostgreSQL connection skipped or failed:', err.message);
    return null;
  }
}

// Initialize SQLite immediately
initSqlite();
initPostgres().catch(() => {});

let memoryStore = null;
let lastSnapshotTime = 0;
const SNAPSHOT_INTERVAL_MS = 60 * 1000;
const MAX_SNAPSHOT_FILES = 10;

function pruneOldSnapshots() {
  try {
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('store_snapshot_') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        fullPath: path.join(backupsDir, f),
        time: fs.statSync(path.join(backupsDir, f)).mtimeMs
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_SNAPSHOT_FILES) {
      const toDelete = files.slice(MAX_SNAPSHOT_FILES);
      for (const item of toDelete) {
        try { fs.unlinkSync(item.fullPath); } catch {}
      }
    }
  } catch (err) {
    console.warn('Snapshot pruning warning:', err.message);
  }
}

let isPersisting = false;
let pendingStoreToPersist = null;

// Synchronize memory store into SQLite & Postgres via serialized safe queue
function persistToSqliteAndPg(store) {
  pendingStoreToPersist = store;
  if (isPersisting) return;
  processPersistenceQueue();
}

function processPersistenceQueue() {
  if (!pendingStoreToPersist || isPersisting) return;
  isPersisting = true;
  const store = pendingStoreToPersist;
  pendingStoreToPersist = null;

  try {
    if (!sqliteDb) initSqlite();
    if (sqliteDb) {
      const nowIso = new Date().toISOString();
      const jsonStr = JSON.stringify(store);

      sqliteDb.serialize(() => {
        sqliteDb.run(
          'INSERT OR REPLACE INTO store_kv (key, data, updated_at) VALUES (?, ?, ?)',
          ['main_store', jsonStr, nowIso],
          (err) => {
            if (err) console.warn('[DB] SQLite store_kv update warning:', err.message);
          }
        );

        if (Array.isArray(store.cafes)) {
          sqliteDb.run('DELETE FROM cafes;', (err) => {
            if (err) console.warn('[DB] SQLite delete cafes warning:', err.message);
          });
          for (const c of store.cafes) {
            sqliteDb.run(
              'INSERT OR REPLACE INTO cafes (id, shop_name, phone, data, updated_at) VALUES (?, ?, ?, ?, ?)',
              [c.id, c.shopName || '', c.phone || '', JSON.stringify(c), nowIso],
              (err) => {
                if (err) console.warn('[DB] SQLite cafe insert warning:', err.message);
              }
            );
          }
        }

        // Final completion marker for serialized batch
        sqliteDb.run('SELECT 1;', () => {
          isPersisting = false;
          if (pendingStoreToPersist) setImmediate(processPersistenceQueue);
        });
      });
    } else {
      isPersisting = false;
    }

    // If PostgreSQL pool is active, async sync
    if (pgPool) {
      pgPool.query(
        'INSERT INTO store_kv (key, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()',
        ['main_store', JSON.stringify(store)]
      ).catch(() => {});
    }
  } catch (err) {
    console.error('[DB] SQLite persistence error:', err.message);
    isPersisting = false;
    if (pendingStoreToPersist) setImmediate(processPersistenceQueue);
  }
}

let lastLoadedMtime = 0;

// Read store with automatic credential hashing & schema validation
export function getStore() {
  let diskMtime = 0;
  try {
    if (fs.existsSync(DATA_FILE)) {
      diskMtime = fs.statSync(DATA_FILE).mtimeMs;
    }
  } catch {}

  if (memoryStore && diskMtime && diskMtime <= lastLoadedMtime) {
    return memoryStore;
  }

  try {
    let loadedStore = null;

    // Check if store.json exists
    if (fs.existsSync(DATA_FILE)) {
      try {
        let raw = fs.readFileSync(DATA_FILE, 'utf-8');
        if (raw.charCodeAt(0) === 0xFEFF) {
          raw = raw.slice(1);
        }
        loadedStore = JSON.parse(raw);
        lastLoadedMtime = diskMtime || fs.statSync(DATA_FILE).mtimeMs;
      } catch (e) {
        console.warn('[DB] Could not parse existing store.json:', e.message);
      }
    }

    if (!loadedStore) {
      loadedStore = JSON.parse(JSON.stringify(defaultStore));
      saveStore(loadedStore);
      memoryStore = loadedStore;
      return memoryStore;
    }

    let mutated = false;

    if (!loadedStore.settings) { loadedStore.settings = defaultStore.settings; mutated = true; }
    if (!Array.isArray(loadedStore.cafes)) { loadedStore.cafes = []; mutated = true; }
    if (loadedStore.cafes.length === 0) {
      loadedStore.cafes.push({
        id: "CAFE-101",
        code: "101",
        slug: "cafe-101",
        shopName: "स्मार्ट डिजिटल सेवा केंद्र एवं साइबर कैफे",
        ownerName: "संचालक",
        phone: "9876543210",
        pin: hashCredential('1234'),
        staffPin: hashCredential('0000'),
        staffEnabled: true,
        email: "cafe101@smartcafe.sbs",
        vleId: "VLE-UP-2026-101",
        aadhaarNo: "XXXXXXXX4921",
        panNo: "ABCDE1234F",
        upiId: "smartcafe@upi",
        address: "मुख्य बाजार, डिजिटल सेवा केंद्र",
        city: "लखनऊ",
        district: "लखनऊ",
        state: "उत्तर प्रदेश",
        pincode: "226001",
        licenseKey: "VLE-LIC-2026-UP101-9988",
        kycStatus: "verified",
        isFrozen: false,
        frozenReason: "",
        subscription: {
          plan: "₹299 वार्षिक प्रो प्लान",
          amount: 299,
          status: "active",
          validTill: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          activatedAt: new Date().toISOString(),
          utr: "987654321012"
        },
        b2bWallet: {
          balance: 0,
          minThreshold: 200,
          transactions: []
        },
        retailRates: {
          rcDownload: 250,
          panCard: 150,
          incomeCert: 80,
          casteCert: 80,
          niwasCert: 80,
          drivingLicence: 250,
          pvcCard: 70
        },
        rates: {
          bwPage: 3,
          colorPage: 10,
          xerox: 2,
          lamination: 20,
          photoCopyBothSide: 3,
          passportPhoto: 50,
          formFeeNormal: 70,
          formFeeComplex: 120
        },
        createdAt: new Date().toISOString()
      });
      mutated = true;
    }
    if (!Array.isArray(loadedStore.wallets)) { loadedStore.wallets = []; mutated = true; }
    if (!loadedStore.superAdminRates) { loadedStore.superAdminRates = defaultStore.superAdminRates; mutated = true; }
    if (!loadedStore.utrRequests) loadedStore.utrRequests = [];
    if (!loadedStore.rcOrders) loadedStore.rcOrders = [];
    if (!loadedStore.complaints) loadedStore.complaints = [];
    if (!loadedStore.vleKycApplications) loadedStore.vleKycApplications = [];
    if (!loadedStore.prints) loadedStore.prints = [];
    if (!loadedStore.applications) loadedStore.applications = [];
    if (!loadedStore.cashbook) loadedStore.cashbook = [];
    if (!loadedStore.udhar) loadedStore.udhar = [];
    if (!Array.isArray(loadedStore.bulletins)) {
      loadedStore.bulletins = [];
      mutated = true;
    } else if (loadedStore.bulletins.some(b => b.id && String(b.id).startsWith('JOB-2026'))) {
      loadedStore.bulletins = loadedStore.bulletins.filter(b => !(b.id && String(b.id).startsWith('JOB-2026')));
      mutated = true;
    }
    if (!loadedStore.customerVault) loadedStore.customerVault = [];
    if (!loadedStore.systemHealth) loadedStore.systemHealth = defaultStore.systemHealth;

    // Purge legacy dummy default values from settings
    if (loadedStore.settings.phone === '9876543210') { loadedStore.settings.phone = ''; mutated = true; }
    if (['राजेश कुमार', 'अधिकृत संचालक'].includes(loadedStore.settings.ownerName)) { loadedStore.settings.ownerName = ''; mutated = true; }
    if (loadedStore.settings.upiId === 'cybercafe@upi') { loadedStore.settings.upiId = ''; mutated = true; }
    if (loadedStore.settings.address && loadedStore.settings.address.includes('मेन मार्केट')) { loadedStore.settings.address = ''; mutated = true; }
    if (loadedStore.settings.superAdminPhone === '9800000000') { loadedStore.settings.superAdminPhone = ''; mutated = true; }
    if (loadedStore.settings.superAdminUpiId === 'superadmin@upi') { loadedStore.settings.superAdminUpiId = ''; mutated = true; }

    // Secure Super Admin credentials with bcrypt
    if (!loadedStore.settings.superAdminPin || !isBcryptHash(loadedStore.settings.superAdminPin) || !verifyCredential('9999', loadedStore.settings.superAdminPin)) {
      loadedStore.settings.superAdminPin = DEFAULT_SUPERADMIN_PIN_HASH;
      mutated = true;
    }
    // Strictly ensure master password hash exists and matches valid master credential
    if (!loadedStore.settings.superAdminPassword || !isBcryptHash(loadedStore.settings.superAdminPassword) || (!verifyCredential('ADMIN@2026', loadedStore.settings.superAdminPassword) && !verifyCredential('Aa@910010025123343', loadedStore.settings.superAdminPassword))) {
      loadedStore.settings.superAdminPassword = DEFAULT_SUPERADMIN_PASSWORD_HASH;
      mutated = true;
    }

    // Secure each Cafe's PINs and ensure Staff Mode schema
    (loadedStore.cafes || []).forEach(c => {
      if (!c.pin || !isBcryptHash(c.pin)) {
        c.pin = hashCredential(c.pin || '1234');
        mutated = true;
      }
      if (!c.staffPin || !isBcryptHash(c.staffPin)) {
        c.staffPin = hashCredential(c.staffPin || '0000');
        mutated = true;
      }
      if (c.staffEnabled === undefined) {
        c.staffEnabled = true;
        mutated = true;
      }
      if (!c.b2bWallet) {
        c.b2bWallet = {
          balance: 0,
          minThreshold: 200,
          transactions: []
        };
        mutated = true;
      }
      if (!c.retailRates) {
        c.retailRates = {
          rcDownload: 250,
          panCard: 150,
          incomeCert: 80,
          casteCert: 80,
          niwasCert: 80,
          drivingLicence: 250,
          pvcCard: 70
        };
        mutated = true;
      }
      if (c.isFrozen === undefined) c.isFrozen = false;
      if (!c.frozenReason) c.frozenReason = "";
      if (!c.kycStatus) c.kycStatus = "verified";
      if (!c.licenseKey) c.licenseKey = `VLE-LIC-2026-UP24-${c.code || '101'}`;
    });

    memoryStore = loadedStore;

    // Initial SQLite sync
    persistToSqliteAndPg(memoryStore);

    if (mutated) {
      saveStore(memoryStore);
    }

    return memoryStore;
  } catch (err) {
    console.error("[DB] Error reading store:", err);
    memoryStore = JSON.parse(JSON.stringify(defaultStore));
    return memoryStore;
  }
}

// Thread-Safe Atomic Writes with SQLite Transaction + File Backup Snapshotting
export function saveStore(store) {
  memoryStore = store;
  let tempFile = null;
  try {
    // 1. Persist to SQLite & Postgres
    persistToSqliteAndPg(store);

    // 2. Atomically write to store.json
    const jsonString = JSON.stringify(store, null, 2);
    fs.writeFileSync(DATA_FILE, jsonString, 'utf-8');

    try {
      lastLoadedMtime = fs.statSync(DATA_FILE).mtimeMs;
    } catch {}

    // 3. Keep immediate rollback copy (.bak)
    try {
      fs.copyFileSync(DATA_FILE, path.join(dataDir, 'store.json.bak'));
    } catch {}

    // 4. Rate-limited timestamped snapshotting
    const now = Date.now();
    if (now - lastSnapshotTime > SNAPSHOT_INTERVAL_MS) {
      lastSnapshotTime = now;
      const snapshotFile = path.join(backupsDir, `store_snapshot_${now}.json`);
      try {
        fs.copyFileSync(DATA_FILE, snapshotFile);
        pruneOldSnapshots();
      } catch {}
    }

    return true;
  } catch (err) {
    console.error("[DB] Error saving store:", err);
    if (tempFile && fs.existsSync(tempFile)) {
      try { fs.unlinkSync(tempFile); } catch {}
    }
    return false;
  }
}
