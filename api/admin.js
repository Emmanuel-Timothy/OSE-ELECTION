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
  const user = authHeader(req);
  if (!user || user.role !== 'admin') return res.status(401).json({ error: 'unauthorized' });

  if (!pool || typeof pool.query !== 'function') {
    console.error('[DB ERROR] pool not initialized', pool);
    return res.status(500).json({ error: 'Database not available' });
  }

  try {
    if (req.method === 'POST') {
      // add user
      const { username, password, role } = req.body || {};
      if (!username || !password) return res.status(400).json({ error: 'username/password required' });
      const insert = await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
        [username, password, role || 'user']
      );
      return res.status(201).json({ ok: true, user: insert.rows[0] });
    }

    if (req.method === 'PUT') {
      // modify user
      const { id, username, password, role } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });

      // build dynamic update
      const fields = [];
      const values = [];
      let idx = 1;
      if (username !== undefined) { fields.push(`username=$${idx++}`); values.push(username); }
      if (password !== undefined) { fields.push(`password=$${idx++}`); values.push(password); }
      if (role !== undefined) { fields.push(`role=$${idx++}`); values.push(role); }
      if (fields.length === 0) return res.status(400).json({ error: 'no fields to update' });

      values.push(id);
      const q = `UPDATE users SET ${fields.join(', ')} WHERE id=$${idx} RETURNING id, username, role`;
      const upd = await pool.query(q, values);
      if (upd.rowCount === 0) return res.status(404).json({ error: 'user not found' });
      return res.json({ ok: true, user: upd.rows[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[ADMIN ERROR]', err);
    return res.status(500).json({ error: 'db' });
  }
};
