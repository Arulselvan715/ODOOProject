const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getActivities, createActivity, deleteActivity } = require('../controllers/activityController');

// Nested: /api/stops/:stopId/activities
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.use(protect);
nestedRouter.get('/', getActivities);
nestedRouter.post('/', createActivity);

// Standalone: /api/activities/:id
const router = express.Router();
router.use(protect);
router.delete('/:id', deleteActivity);

module.exports = { nestedRouter, router };
