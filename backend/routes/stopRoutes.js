const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getStops, createStop, updateStop, deleteStop, reorderStops } = require('../controllers/stopController');

// Nested router: /api/trips/:tripId/stops
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.use(protect);
nestedRouter.get('/', getStops);
nestedRouter.post('/', createStop);
nestedRouter.put('/reorder', reorderStops);

// Standalone router: /api/stops/:id
const router = express.Router();
router.use(protect);
router.put('/:id', updateStop);
router.delete('/:id', deleteStop);

module.exports = { nestedRouter, router };
