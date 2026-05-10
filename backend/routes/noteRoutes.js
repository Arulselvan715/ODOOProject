const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/noteController');

// Nested: /api/trips/:tripId/notes
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.use(protect);
nestedRouter.get('/', getNotes);
nestedRouter.post('/', createNote);

// Standalone: /api/notes/:id
const router = express.Router();
router.use(protect);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = { nestedRouter, router };
