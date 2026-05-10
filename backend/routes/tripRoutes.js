const express = require('express');
const router = express.Router();
const {
  getTrips, getTripById, createTrip, updateTrip, deleteTrip,
  shareTrip, unshareTrip, getSharedTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// Public route for shared trips
router.get('/shared/:token', getSharedTrip);

// Protected routes
router.use(protect);
router.get('/', getTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/share', shareTrip);
router.delete('/:id/share', unshareTrip);

module.exports = router;
