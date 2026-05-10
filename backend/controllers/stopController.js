// ============================================================
// controllers/stopController.js — Trip Stops (Itinerary Cities)
// ============================================================
const pool = require('../db/db');

// ── GET /api/trips/:tripId/stops ─────────────────────────────
const getStops = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*,
        (SELECT COALESCE(SUM(cost), 0) FROM activities WHERE stop_id = s.id) AS activity_total
       FROM trip_stops s
       WHERE s.trip_id = $1
       ORDER BY s.order_index, s.id`,
      [req.params.tripId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getStops error:', err);
    res.status(500).json({ error: 'Failed to fetch stops.' });
  }
};

// ── POST /api/trips/:tripId/stops ────────────────────────────
const createStop = async (req, res) => {
  const { city, country, arrival_date, departure_date, notes } = req.body;
  if (!city) return res.status(400).json({ error: 'City is required.' });

  try {
    // Get current max order_index
    const maxIdx = await pool.query(
      'SELECT COALESCE(MAX(order_index), -1) + 1 AS next_idx FROM trip_stops WHERE trip_id = $1',
      [req.params.tripId]
    );
    const nextIdx = maxIdx.rows[0].next_idx;

    const result = await pool.query(
      `INSERT INTO trip_stops (trip_id, city, country, arrival_date, departure_date, order_index, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.params.tripId, city, country || null, arrival_date || null, departure_date || null, nextIdx, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createStop error:', err);
    res.status(500).json({ error: 'Failed to create stop.' });
  }
};

// ── PUT /api/stops/:id ───────────────────────────────────────
const updateStop = async (req, res) => {
  const { city, country, arrival_date, departure_date, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE trip_stops SET
        city = COALESCE($1, city),
        country = $2,
        arrival_date = $3,
        departure_date = $4,
        notes = $5
       WHERE id = $6
       RETURNING *`,
      [city, country || null, arrival_date || null, departure_date || null, notes || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Stop not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateStop error:', err);
    res.status(500).json({ error: 'Failed to update stop.' });
  }
};

// ── DELETE /api/stops/:id ────────────────────────────────────
const deleteStop = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM trip_stops WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Stop not found.' });
    res.json({ message: 'Stop deleted.' });
  } catch (err) {
    console.error('deleteStop error:', err);
    res.status(500).json({ error: 'Failed to delete stop.' });
  }
};

// ── PUT /api/trips/:tripId/stops/reorder ─────────────────────
const reorderStops = async (req, res) => {
  const { order } = req.body; // [{ id: 1, order_index: 0 }, ...]
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array.' });

  try {
    // Update each stop's order_index
    const updates = order.map(({ id, order_index }) =>
      pool.query('UPDATE trip_stops SET order_index = $1 WHERE id = $2', [order_index, id])
    );
    await Promise.all(updates);
    res.json({ message: 'Order updated.' });
  } catch (err) {
    console.error('reorderStops error:', err);
    res.status(500).json({ error: 'Failed to reorder stops.' });
  }
};

module.exports = { getStops, createStop, updateStop, deleteStop, reorderStops };
