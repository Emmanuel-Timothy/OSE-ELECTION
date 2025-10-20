const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || '';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;