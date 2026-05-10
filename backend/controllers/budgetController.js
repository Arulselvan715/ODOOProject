// ============================================================
// controllers/budgetController.js — Budget per Trip
// ============================================================
const pool = require('../db/db');

// ── GET /api/trips/:tripId/budget ────────────────────────────
const getBudget = async (req, res) => {
  try {
    // Get or create budget row
    let result = await pool.query('SELECT * FROM budgets WHERE trip_id = $1', [req.params.tripId]);

    if (!result.rows.length) {
      result = await pool.query(
        'INSERT INTO budgets (trip_id) VALUES ($1) RETURNING *',
        [req.params.tripId]
      );
    }

    const budget = result.rows[0];

    // Calculate activity costs from all activities in all stops of this trip
    const actResult = await pool.query(
      `SELECT COALESCE(SUM(a.cost), 0) AS activity_cost
       FROM activities a
       JOIN trip_stops s ON a.stop_id = s.id
       WHERE s.trip_id = $1`,
      [req.params.tripId]
    );
    budget.activity_cost = parseFloat(actResult.rows[0].activity_cost) || 0;

    res.json(budget);
  } catch (err) {
    console.error('getBudget error:', err);
    res.status(500).json({ error: 'Failed to fetch budget.' });
  }
};

// ── PUT /api/trips/:tripId/budget ────────────────────────────
const upsertBudget = async (req, res) => {
  const { transport_cost, stay_cost, food_cost, other_cost } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO budgets (trip_id, transport_cost, stay_cost, food_cost, other_cost, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (trip_id) DO UPDATE SET
         transport_cost = $2,
         stay_cost = $3,
         food_cost = $4,
         other_cost = $5,
         updated_at = NOW()
       RETURNING *`,
      [
        req.params.tripId,
        parseFloat(transport_cost) || 0,
        parseFloat(stay_cost) || 0,
        parseFloat(food_cost) || 0,
        parseFloat(other_cost) || 0,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('upsertBudget error:', err);
    res.status(500).json({ error: 'Failed to save budget.' });
  }
};

module.exports = { getBudget, upsertBudget };
