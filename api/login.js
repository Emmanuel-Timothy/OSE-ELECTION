const db = require('../db/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  db.get("SELECT role FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ role: row.role });
  });
};
