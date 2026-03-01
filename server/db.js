require('dotenv').config()
const mysql = require('mysql2/promise')

// ─── Connection Pool ──────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finlabs',
  waitForConnections: true,
  connectionLimit: 10,
  // ApsaraDB RDS requires SSL — set DB_SSL=true in .env for production
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

// ─── Schema & Seed Data ───────────────────────────────────────────────────────
const DDL = [
  `CREATE TABLE IF NOT EXISTS users (
    id               VARCHAR(20)  PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    totalMonthlyGoal INT          NOT NULL,
    avatar           VARCHAR(10)  NOT NULL,
    google_id        VARCHAR(100),
    email            VARCHAR(255),
    avatar_url       TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS user_profiles (
    id                INT          AUTO_INCREMENT PRIMARY KEY,
    user_id           VARCHAR(20)  NOT NULL UNIQUE,
    persona_type      VARCHAR(50),
    financial_goals   TEXT,
    money_constraints TEXT,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS budgets (
    id           VARCHAR(20) PRIMARY KEY,
    user_id      VARCHAR(20) NOT NULL,
    categoryId   VARCHAR(30) NOT NULL,
    categoryName VARCHAR(50) NOT NULL,
    \`limit\`      INT         NOT NULL,
    currentSpent INT         NOT NULL DEFAULT 0,
    color        VARCHAR(20) NOT NULL,
    emoji        VARCHAR(10) NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id            VARCHAR(20)  PRIMARY KEY,
    user_id       VARCHAR(20)  NOT NULL,
    date          DATETIME     NOT NULL,
    merchant      VARCHAR(100) NOT NULL,
    amount        INT          NOT NULL,
    paymentSource VARCHAR(50)  NOT NULL,
    categoryId    VARCHAR(30)  NOT NULL,
    categoryName  VARCHAR(50)  NOT NULL,
    emoji         VARCHAR(10)  NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id              VARCHAR(20)  PRIMARY KEY,
    user_id         VARCHAR(20)  NOT NULL,
    serviceName     VARCHAR(100) NOT NULL,
    amount          INT          NOT NULL,
    nextBillingDate DATE         NOT NULL,
    isVampireRisk   TINYINT(1)   NOT NULL DEFAULT 0,
    bgColor         VARCHAR(20)  NOT NULL,
    emoji           VARCHAR(10)  NOT NULL,
    category        VARCHAR(50)  NOT NULL,
    vampireReason   TEXT
  )`,
]

const SEED = {
  users: [
    ['U-101', 'Edward', 5000000, 'EW'],
  ],
  budgets: [
    ['B-01', 'C-FOOD',    'Foods',         1500000, 1230000, '#4F9DFF', '🍛'],
    ['B-02', 'C-DRINK',   'Drinks',         500000,  250000, '#00E5A0', '☕'],
    ['B-03', 'C-SNACK',   'Snacks',         300000,  130000, '#FBBF24', '🍟'],
    ['B-04', 'C-ENTERTAIN','Entertainment', 200000,   50000, '#F472B6', '🎬'],
  ],
  transactions: [
    ['TX-001', '2026-02-28 08:30:00', 'Kopi Janji Jiwa',  27000, 'GoPay',     'C-DRINK',    'Drinks',        '☕'],
    ['TX-002', '2026-02-28 12:30:00', 'Warteg Bu Sari',   18000, 'Cash',      'C-FOOD',     'Foods',         '🍛'],
    ['TX-991', '2026-02-27 13:00:00', 'Indomaret',        23400, 'Mandiri',   'C-SNACK',    'Snacks',        '🛒'],
    ['TX-003', '2026-02-27 19:30:00', 'Bakmi Naga',       55000, 'OVO',       'C-FOOD',     'Foods',         '🍜'],
    ['TX-004', '2026-02-27 15:00:00', 'Chatime',          45000, 'ShopeePay', 'C-DRINK',    'Drinks',        '🧋'],
    ['TX-992', '2026-02-26 19:00:00', 'Sei Indonesia',    40000, 'ShopeePay', 'C-FOOD',     'Foods',         '🍖'],
    ['TX-005', '2026-02-26 08:00:00', 'Starbucks',        68000, 'GoPay',     'C-DRINK',    'Drinks',        '☕'],
    ['TX-006', '2026-02-26 14:00:00', 'KFC Sudirman',     75000, 'Mandiri',   'C-FOOD',     'Foods',         '🍗'],
    ['TX-007', '2026-02-25 12:00:00', 'Warung Padang',    28000, 'Cash',      'C-FOOD',     'Foods',         '🍛'],
    ['TX-008', '2026-02-25 20:00:00', 'Netflix',          54000, 'BCA',       'C-ENTERTAIN','Entertainment', '🎬'],
    ['TX-009', '2026-02-25 16:30:00', 'Miniso',           89000, 'OVO',       'C-SNACK',    'Snacks',        '🛍️'],
    ['TX-010', '2026-02-24 07:30:00', 'Fore Coffee',      38000, 'GoPay',     'C-DRINK',    'Drinks',        '☕'],
    ['TX-011', '2026-02-24 13:00:00', 'Sushi Tei',       165000, 'BCA',       'C-FOOD',     'Foods',         '🍱'],
  ],
  // [id, serviceName, amount, nextBillingDate, isVampireRisk, bgColor, emoji, category, vampireReason]
  subscriptions: [
    ['SUB-1', 'YouTube Premium', 69000,  '2026-03-01', 0, '#FF0000', '▶️', 'Entertainment', null],
    ['SUB-2', 'ChatGPT Go',      70000,  '2026-03-06', 1, '#10A37F', '🤖', 'AI Tools',      'Duplikat dengan Gemini Advanced'],
    ['SUB-3', 'Gemini Advanced', 309000, '2026-03-09', 0, '#4285F4', '✨', 'AI Tools',      null],
    ['SUB-4', 'Spotify Premium', 54990,  '2026-03-15', 0, '#1DB954', '🎵', 'Music',         null],
  ],
}

// ─── Init & Seed ──────────────────────────────────────────────────────────────
async function initializeDatabase() {
  const conn = await pool.getConnection()
  try {
    console.log('🗄️  Connecting to ApsaraDB MySQL...')

    // Create tables
    for (const ddl of DDL) {
      await conn.execute(ddl)
    }
    console.log('✅ Tables verified.')

    // ── Live-migration: add new columns to users if they don't exist yet ──
    // MySQL does not support "ADD COLUMN IF NOT EXISTS", so we try/catch.
    const newUserColumns = [
      'ALTER TABLE users ADD COLUMN google_id  VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN email       VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN avatar_url  TEXT',
    ]
    for (const sql of newUserColumns) {
      try { await conn.execute(sql) } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e // rethrow unexpected errors
      }
    }

    // ── Live-migration: add user_id to data tables for multi-user isolation ──
    const userIdMigrations = [
      'ALTER TABLE budgets ADD COLUMN user_id VARCHAR(20)',
      'ALTER TABLE transactions ADD COLUMN user_id VARCHAR(20)',
      'ALTER TABLE subscriptions ADD COLUMN user_id VARCHAR(20)',
    ]
    for (const sql of userIdMigrations) {
      try { await conn.execute(sql) } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e
      }
    }
    // Backfill: existing seeded rows belong to the demo user
    await conn.execute("UPDATE budgets SET user_id = 'U-101' WHERE user_id IS NULL")
    await conn.execute("UPDATE transactions SET user_id = 'U-101' WHERE user_id IS NULL")
    await conn.execute("UPDATE subscriptions SET user_id = 'U-101' WHERE user_id IS NULL")

    // Seed only if users table is empty
    const [[{ cnt }]] = await conn.execute('SELECT COUNT(*) AS cnt FROM users')
    if (cnt > 0) {
      console.log(`ℹ️  Database already seeded (${cnt} user(s) found). Skipping.`)
      return
    }

    console.log('🌱 Seeding initial data...')
    await conn.execute(
      'INSERT INTO users (id, name, totalMonthlyGoal, avatar) VALUES (?, ?, ?, ?)',
      SEED.users[0]
    )

    for (const row of SEED.budgets) {
      await conn.execute(
        'INSERT INTO budgets (id, user_id, categoryId, categoryName, `limit`, currentSpent, color, emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [row[0], 'U-101', ...row.slice(1)]
      )
    }

    for (const row of SEED.transactions) {
      await conn.execute(
        'INSERT INTO transactions (id, user_id, date, merchant, amount, paymentSource, categoryId, categoryName, emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [row[0], 'U-101', ...row.slice(1)]
      )
    }

    for (const row of SEED.subscriptions) {
      await conn.execute(
        'INSERT INTO subscriptions (id, user_id, serviceName, amount, nextBillingDate, isVampireRisk, bgColor, emoji, category, vampireReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [row[0], 'U-101', ...row.slice(1)]
      )
    }

    console.log('✅ Database seeded successfully.')
  } finally {
    conn.release()
  }
}

module.exports = { pool, initializeDatabase }
