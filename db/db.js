const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test pool on startup
pool.on('error', (err) => {
  console.error('Unexpected PG error', err);
});

// Export connection tester
pool.testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  }
};

module.exports = pool;