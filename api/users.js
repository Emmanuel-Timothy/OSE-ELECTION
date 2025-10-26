const poolModule = require('../db/db');
const pool = poolModule && (poolModule.default || poolModule);

async function requireAdmin(body) {
  if (!body || !body.username || !body.password) return null;
  const r = await pool.query('SELECT role FROM users WHERE username=$1 AND password=$2', [body.username, body.password]);
  if (r.rows.length === 0) return null;
  return r.rows[0].role === 'admin';
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const r = await pool.query('SELECT id, username, role FROM users ORDER BY id');
      return res.status(200).json(r.rows);
    }

    if (req.method === 'POST') {
      const ok = await requireAdmin(req.body);
      if (!ok) return res.status(403).json({ error: 'Admin only' });
      const { username, password, role } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
      const insert = await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role', [username, password, role || null]);
      return res.status(200).json(insert.rows[0]);
    }

    if (req.method === 'DELETE') {
      const ok = await requireAdmin(req.body);
      if (!ok) return res.status(403).json({ error: 'Admin only' });
      const { id } = req.body;
      await pool.query('DELETE FROM users WHERE id=$1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[USERS ERROR]', err);
    return res.status(500).json({ error: 'Database error' });
  }
};
