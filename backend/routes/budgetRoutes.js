const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getBudget, upsertBudget } = require('../controllers/budgetController');

// Nested: /api/trips/:tripId/budget
const router = express.Router({ mergeParams: true });
router.use(protect);
router.get('/', getBudget);
router.put('/', upsertBudget);

module.exports = router;
