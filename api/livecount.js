// api/livecount.js - Vercel serverless handler
const poolModule = require('../db/db');
const pool = poolModule && (poolModule.default || poolModule);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    if (!pool || typeof pool.query !== 'function') {
      console.error('[DB ERROR] pool not initialized', pool);
      return res.status(500).json({ error: 'Database not available' });
    }

    const rows = await pool.query(`
      SELECT c.id, c.name, COUNT(v.id) as votes
      FROM candidates c
      LEFT JOIN votes v ON v.candidate_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.id
    `);
    res.json(rows.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db' });
  }
};
