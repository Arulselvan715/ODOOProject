// ============================================================
// controllers/activityController.js — Activities per Stop
// ============================================================
const pool = require('../db/db');

// ── GET /api/stops/:stopId/activities ────────────────────────
const getActivities = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM activities WHERE stop_id = $1 ORDER BY id',
      [req.params.stopId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getActivities error:', err);
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
};

// ── POST /api/stops/:stopId/activities ───────────────────────
const createActivity = async (req, res) => {
  const { name, category, cost, duration_hours, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Activity name is required.' });

  try {
    const result = await pool.query(
      `INSERT INTO activities (stop_id, name, category, cost, duration_hours, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.params.stopId, name, category || null, parseFloat(cost) || 0, parseFloat(duration_hours) || 1, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createActivity error:', err);
    res.status(500).json({ error: 'Failed to create activity.' });
  }
};

// ── DELETE /api/activities/:id ───────────────────────────────
const deleteActivity = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Activity not found.' });
    res.json({ message: 'Activity deleted.' });
  } catch (err) {
    console.error('deleteActivity error:', err);
    res.status(500).json({ error: 'Failed to delete activity.' });
  }
};

module.exports = { getActivities, createActivity, deleteActivity };
