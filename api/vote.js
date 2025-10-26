const poolModule = require('../db/db');
const pool = poolModule && (poolModule.default || poolModule);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password, candidate_id } = req.body || {};
  if (!username || !password || !candidate_id) return res.status(400).json({ error: 'Missing data' });

  try {
    const userRes = await pool.query('SELECT id, role FROM users WHERE username=$1 AND password=$2', [username, password]);
    if (userRes.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = userRes.rows[0];
    if (user.role !== 'murid') return res.status(403).json({ error: 'Only students can vote' });

    const voted = await pool.query('SELECT id FROM votes WHERE user_id=$1', [user.id]);
    if (voted.rows.length > 0) return res.status(409).json({ error: 'User has already voted' });

    // ensure candidate exists
    const cand = await pool.query('SELECT id FROM candidates WHERE id=$1', [candidate_id]);
    if (cand.rows.length === 0) return res.status(400).json({ error: 'Candidate not found' });

    await pool.query('INSERT INTO votes (user_id, candidate_id) VALUES ($1, $2)', [user.id, candidate_id]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[VOTE ERROR]', err);
    return res.status(500).json({ error: 'Database error' });
  }
};
