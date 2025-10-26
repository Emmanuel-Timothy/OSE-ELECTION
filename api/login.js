const poolModule = require('../db/db');
const pool = poolModule && (poolModule.default || poolModule);
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Test DB connection first
  if (!pool) {
    console.error('[DB ERROR] pool not initialized');
    return res.status(500).json({ error: 'Database configuration error' });
  }

  try {
    const connected = await pool.testConnection();
    if (!connected) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
  } catch (err) {
    console.error('[DB CONNECTION ERROR]', err);
    return res.status(500).json({ error: 'Database connection error' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  try {
    if (!pool || typeof pool.query !== 'function') {
      console.error('[DB ERROR] pool not initialized', pool);
      return res.status(500).json({ error: 'Database not available' });
    }

    const result = await pool.query(
      'SELECT id, role FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    return res.status(200).json({ role: user.role, token });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ error: 'Database error' });
  }
};
