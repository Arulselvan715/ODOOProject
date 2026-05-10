// ============================================================
// controllers/noteController.js — Notes / Journal
// ============================================================
const pool = require('../db/db');

const getNotes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE trip_id = $1 ORDER BY updated_at DESC',
      [req.params.tripId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
};

const createNote = async (req, res) => {
  const { title, content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required.' });
  try {
    const result = await pool.query(
      'INSERT INTO notes (trip_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.tripId, title || null, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note.' });
  }
};

const updateNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = COALESCE($2, content), updated_at = NOW() WHERE id = $3 RETURNING *',
      [title || null, content, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Note not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note.' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Note not found.' });
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note.' });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
