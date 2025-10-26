// api/vote.js - Vercel serverless handler
const poolModule = require('../db/db');
const pool = poolModule && (poolModule.default || poolModule);
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const MAX_VOTES_PER_USER = 3;

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

  // Accept either candidate_id (number) or candidate_ids (array)
  let { candidate_id, candidate_ids } = req.body || {};
  let candidates = [];

  if (Array.isArray(candidate_ids)) candidates = candidate_ids.map(Number).filter(Boolean);
  else if (candidate_id !== undefined) {
    if (Array.isArray(candidate_id)) candidates = candidate_id.map(Number).filter(Boolean);
    else candidates = [Number(candidate_id)].filter(Boolean);
  }

  // validate
  if (candidates.length === 0) return res.status(400).json({ error: 'No candidate selected' });
  // dedupe client-side choices
  candidates = [...new Set(candidates)];
  if (candidates.length > MAX_VOTES_PER_USER) return res.status(400).json({ error: `You can vote for up to ${MAX_VOTES_PER_USER} candidates` });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // get existing votes count and candidate_ids
    const existingRes = await client.query('SELECT candidate_id FROM votes WHERE user_id=$1 FOR SHARE', [user.id]);
    const existingCandidates = existingRes.rows.map(r => Number(r.candidate_id));
    const existingCount = existingCandidates.length;

    // prevent voting same candidate again
    const duplicate = candidates.find(c => existingCandidates.includes(c));
    if (duplicate !== undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You already voted for one or more selected candidates' });
    }

    if (existingCount + candidates.length > MAX_VOTES_PER_USER) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Total votes exceed limit of ${MAX_VOTES_PER_USER}` });
    }

    // Optional: ensure each candidate exists (fail early)
    const vals = candidates.map((_, i) => `$${i+1}`).join(',');
    const checkRes = await client.query(`SELECT id FROM candidates WHERE id IN (${vals})`, candidates);
    if (checkRes.rowCount !== candidates.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'One or more candidates are invalid' });
    }

    // insert votes
    for (const cid of candidates) {
      await client.query('INSERT INTO votes (user_id, candidate_id) VALUES ($1, $2)', [user.id, cid]);
    }

    await client.query('COMMIT');
    res.json({ ok: true, added: candidates.length, total: existingCount + candidates.length });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'db' });
  } finally { client.release(); }
};
