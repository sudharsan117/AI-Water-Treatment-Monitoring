const express = require('express');
const router = express.Router();
const {
  getSensors,
  createSensor,
  updateSensor,
  getSensorReadings,
  getLatestReadings,
  recordReading
} = require('../controllers/sensorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getSensors);
router.get('/readings/latest', protect, getLatestReadings);
router.get('/:sensorId/readings', protect, getSensorReadings);
router.post('/readings', protect, recordReading);
router.post('/', protect, authorize('ADMIN'), createSensor);
router.put('/:id', protect, authorize('ADMIN'), updateSensor);

module.exports = router;
