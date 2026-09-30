const express = require('express');
const router = express.Router();
const { getThresholds, updateThreshold, createThreshold } = require('../controllers/thresholdController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getThresholds);
router.post('/', protect, authorize('ADMIN'), createThreshold);
router.put('/:id', protect, authorize('ADMIN'), updateThreshold);

module.exports = router;
