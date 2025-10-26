const poolModule = require('../../db/db');
const pool = poolModule && (poolModule.default || poolModule);
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function authHeader(req){
  const a = req.headers.authorization; if(!a) return null;
  const parts = a.split(' '); if(parts.length !==2) return null;
  try { return jwt.verify(parts[1], JWT_SECRET); } catch(e){ return null; }
}

module.exports = async (req, res) => {
  const user = authHeader(req);
  if (!user || user.role !== 'admin') return res.status(401).json({ error: 'unauthorized' });

  if (!pool || typeof pool.query !== 'function') {
    console.error('[DB ERROR] pool not initialized', pool);
    return res.status(500).json({ error: 'Database not available' });
  }

  try {
    const result = await pool.query('SELECT id, username, role FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('[ADMIN USERS ERROR]', err);
    return res.status(500).json({ error: 'db' });
  }
};
