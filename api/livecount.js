const poolModule = require('../db/db');
const pool = poolModule && (poolModule.default || poolModule);

async function getUserByCreds(body) {
  if (!body || !body.username || !body.password) return null;
  const r = await pool.query('SELECT id, role, username FROM users WHERE username=$1 AND password=$2', [body.username, body.password]);
  return r.rows[0] || null;
}

// helper to extract credentials from body or headers (x-username/x-password or Basic)
function extractCreds(req) {
  const creds = {};
  if (req.body && req.body.username && req.body.password) {
    creds.username = req.body.username;
    creds.password = req.body.password;
    return creds;
  }
  if (req.headers) {
    if (req.headers['x-username'] && req.headers['x-password']) {
      creds.username = req.headers['x-username'];
      creds.password = req.headers['x-password'];
      return creds;
    }
    if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
      try {
        const b = Buffer.from(req.headers.authorization.slice(6), 'base64').toString('utf8');
        const idx = b.indexOf(':');
        if (idx !== -1) {
          creds.username = b.slice(0, idx);
          creds.password = b.slice(idx + 1);
          return creds;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }
  return null;
}

module.exports = async (req, res) => {
  try {
    const detail = (req.query && req.query.detail === 'true') || false;
    const counts = await pool.query(`
      SELECT c.id, c.name, COUNT(v.id) AS votes
      FROM candidates c
      LEFT JOIN votes v ON v.candidate_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.id
    `);
    const result = { counts: counts.rows.map(r => ({ id: r.id, name: r.name, votes: Number(r.votes) })) };

    if (detail) {
      // extract credentials from body or headers (supports body, x-username/x-password, Basic)
      const creds = extractCreds(req);
      const user = await getUserByCreds(creds);
      if (!user || !['guru', 'parcom', 'admin'].includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const votes = await pool.query(`
        SELECT v.id, v.user_id, u.username, v.candidate_id, c.name AS candidate_name, v.created_at
        FROM votes v
        JOIN users u ON u.id = v.user_id
        JOIN candidates c ON c.id = v.candidate_id
        ORDER BY v.created_at DESC
      `);
      result.votes = votes.rows;
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[LIVECOUNT ERROR]', err);
    return res.status(500).json({ error: 'Database error' });
  }
};
