require('dotenv').config()
const mysql = require('mysql2/promise')

async function test() {
  console.log('Testing connection to:', process.env.DB_HOST)
  try {
    const conn = await mysql.createConnection({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT || '3306'),
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 10000,
    })
    const [rows] = await conn.execute('SELECT VERSION() AS version')
    console.log('✅ Connected! MySQL version:', rows[0].version)
    await conn.end()
  } catch (err) {
    console.error('❌ Connection failed:', err.code, '-', err.message)
    if (err.code === 'ETIMEDOUT')   console.error('   → IP belum diwhitelist di ApsaraDB Console')
    if (err.code === 'ECONNREFUSED') console.error('   → Host/port salah, atau RDS belum running')
    if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('   → Username/password salah')
    if (err.code === 'ER_BAD_DB_ERROR') console.error('   → Database "finlabs" belum dibuat di RDS Console')
  }
}

test()
