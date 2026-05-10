// ============================================================
// controllers/tripController.js — Trip CRUD + Share
// ============================================================
const pool = require('../db/db');
const crypto = require('crypto');

// ── GET /api/trips ───────────────────────────────────────────
const getTrips = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM trip_stops WHERE trip_id = t.id) AS stop_count,
        (SELECT COUNT(*) FROM notes WHERE trip_id = t.id) AS note_count
       FROM trips t
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getTrips error:', err);
    res.status(500).json({ error: 'Failed to fetch trips.' });
  }
};

// ── GET /api/trips/:id ───────────────────────────────────────
const getTripById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trips WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Trip not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getTripById error:', err);
    res.status(500).json({ error: 'Failed to fetch trip.' });
  }
};

// ── POST /api/trips ──────────────────────────────────────────
const createTrip = async (req, res) => {
  const { name, description, start_date, end_date, cover_image } = req.body;
  if (!name) return res.status(400).json({ error: 'Trip name is required.' });

  try {
    const result = await pool.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, name, description || null, start_date || null, end_date || null, cover_image || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createTrip error:', err);
    res.status(500).json({ error: 'Failed to create trip.' });
  }
};

// ── PUT /api/trips/:id ───────────────────────────────────────
const updateTrip = async (req, res) => {
  const { name, description, start_date, end_date, cover_image } = req.body;
  try {
    const result = await pool.query(
      `UPDATE trips SET
        name = COALESCE($1, name),
        description = $2,
        start_date = $3,
        end_date = $4,
        cover_image = $5,
        updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, description || null, start_date || null, end_date || null, cover_image || null, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Trip not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateTrip error:', err);
    res.status(500).json({ error: 'Failed to update trip.' });
  }
};

// ── DELETE /api/trips/:id ────────────────────────────────────
const deleteTrip = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ message: 'Trip deleted successfully.' });
  } catch (err) {
    console.error('deleteTrip error:', err);
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
};

// ── POST /api/trips/:id/share ────────────────────────────────
const shareTrip = async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const result = await pool.query(
      'UPDATE trips SET is_public = TRUE, share_token = $1 WHERE id = $2 AND user_id = $3 RETURNING share_token',
      [token, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ share_token: result.rows[0].share_token, message: 'Trip is now public.' });
  } catch (err) {
    console.error('shareTrip error:', err);
    res.status(500).json({ error: 'Failed to share trip.' });
  }
};

// ── DELETE /api/trips/:id/share ──────────────────────────────
const unshareTrip = async (req, res) => {
  try {
    await pool.query(
      'UPDATE trips SET is_public = FALSE, share_token = NULL WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Trip is now private.' });
  } catch (err) {
    console.error('unshareTrip error:', err);
    res.status(500).json({ error: 'Failed to unshare trip.' });
  }
};

// ── GET /api/shared/:token ───────────────────────────────────
const getSharedTrip = async (req, res) => {
  try {
    const tripResult = await pool.query(
      `SELECT t.*, u.name as owner_name FROM trips t
       JOIN users u ON t.user_id = u.id
       WHERE t.share_token = $1 AND t.is_public = TRUE`,
      [req.params.token]
    );
    if (!tripResult.rows.length) return res.status(404).json({ error: 'Shared trip not found or no longer public.' });

    const trip = tripResult.rows[0];

    // Fetch stops and activities
    const stopsResult = await pool.query(
      'SELECT * FROM trip_stops WHERE trip_id = $1 ORDER BY order_index, id',
      [trip.id]
    );
    const stops = stopsResult.rows;

    for (const stop of stops) {
      const actResult = await pool.query(
        'SELECT * FROM activities WHERE stop_id = $1 ORDER BY id',
        [stop.id]
      );
      stop.activities = actResult.rows;
    }

    res.json({ trip, stops });
  } catch (err) {
    console.error('getSharedTrip error:', err);
    res.status(500).json({ error: 'Failed to load shared trip.' });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip, shareTrip, unshareTrip, getSharedTrip };
