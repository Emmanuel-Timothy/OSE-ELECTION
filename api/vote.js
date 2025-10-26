// api/vote.js - Vercel serverless handler
const poolModule = require('../db/db');
const pool = poolModule && (poolModule.default || poolModule);
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function authHeader(req){
  const a = req.headers.authorization; if(!a) return null;
  const parts = a.split(' '); if(parts.length !==2) return null;
  try { return jwt.verify(parts[1], JWT_SECRET); } catch(e){ return null; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const user = authHeader(req);
  if (!user) return res.status(401).json({ error: 'noauth' });

  if (!pool || typeof pool.connect !== 'function') {
    console.error('[DB ERROR] pool not initialized', pool);
    return res.status(500).json({ error: 'Database not available' });
  }

  const { candidate_id } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const already = await client.query('SELECT 1 FROM votes WHERE user_id=$1 FOR SHARE', [user.id]);
    if (already.rowCount > 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'User has already voted' }); }
    await client.query('INSERT INTO votes (user_id, candidate_id) VALUES ($1, $2)', [user.id, candidate_id]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'db' });
  } finally { client.release(); }
};
