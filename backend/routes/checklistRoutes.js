const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getChecklist, addItem, toggleItem, deleteItem } = require('../controllers/checklistController');

// Nested: /api/trips/:tripId/checklist
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.use(protect);
nestedRouter.get('/', getChecklist);
nestedRouter.post('/', addItem);

// Standalone: /api/checklist/:id
const router = express.Router();
router.use(protect);
router.patch('/:id/toggle', toggleItem);
router.delete('/:id', deleteItem);

module.exports = { nestedRouter, router };
