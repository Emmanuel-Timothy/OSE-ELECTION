const pool = require('../db/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const role = result.rows[0].role;
    return res.status(200).json({ role });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
};
