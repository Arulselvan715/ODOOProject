// ============================================================
// controllers/checklistController.js — Packing Checklist
// ============================================================
const pool = require('../db/db');

const getChecklist = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM packing_checklist WHERE trip_id = $1 ORDER BY created_at',
      [req.params.tripId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch checklist.' });
  }
};

const addItem = async (req, res) => {
  const { item_name } = req.body;
  if (!item_name) return res.status(400).json({ error: 'Item name is required.' });
  try {
    const result = await pool.query(
      'INSERT INTO packing_checklist (trip_id, item_name) VALUES ($1, $2) RETURNING *',
      [req.params.tripId, item_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item.' });
  }
};

const toggleItem = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE packing_checklist SET is_packed = NOT is_packed WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Item not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle item.' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM packing_checklist WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Item not found.' });
    res.json({ message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item.' });
  }
};

module.exports = { getChecklist, addItem, toggleItem, deleteItem };
