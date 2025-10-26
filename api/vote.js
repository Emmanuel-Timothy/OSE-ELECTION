// api/vote.js - Vercel serverless handler
const poolModule = require('../db/db');
const pool = poolModule && (poolModule.default || poolModule);
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
// Restrict to a single vote
const MAX_VOTES_PER_USER = 1;

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

  // Accept single candidate_id (prefer) or candidate_ids array but enforce one
  let { candidate_id, candidate_ids } = req.body || {};
  let candidates = [];

  if (Array.isArray(candidate_ids)) candidates = candidate_ids.map(Number).filter(Boolean);
  else if (candidate_id !== undefined) {
    if (Array.isArray(candidate_id)) candidates = candidate_id.map(Number).filter(Boolean);
    else candidates = [Number(candidate_id)].filter(Boolean);
  }

  // validate - must select exactly one
  if (candidates.length === 0) return res.status(400).json({ error: 'No candidate selected' });
  // dedupe
  candidates = [...new Set(candidates)];
  if (candidates.length !== MAX_VOTES_PER_USER) return res.status(400).json({ error: `Select exactly ${MAX_VOTES_PER_USER} candidate` });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // get existing votes
    const existingRes = await client.query('SELECT candidate_id FROM votes WHERE user_id=$1 FOR SHARE', [user.id]);
    const existingCandidates = existingRes.rows.map(r => Number(r.candidate_id));
    const existingCount = existingCandidates.length;

    // if already voted at all -> reject (since max is 1)
    if (existingCount >= MAX_VOTES_PER_USER) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User has already voted' });
    }

    // ensure the selected candidate is not already in existing (redundant above but safe)
    const duplicate = candidates.find(c => existingCandidates.includes(c));
    if (duplicate !== undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'You already voted for this candidate' });
    }

    // ensure candidate exists
    const cid = candidates[0];
    const checkRes = await client.query('SELECT id FROM candidates WHERE id=$1', [cid]);
    if (checkRes.rowCount !== 1) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Candidate is invalid' });
    }

    // insert the single vote
    await client.query('INSERT INTO votes (user_id, candidate_id) VALUES ($1, $2)', [user.id, cid]);

    await client.query('COMMIT');
    res.json({ ok: true, added: 1, total: existingCount + 1 });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'db' });
  } finally { client.release(); }
};
