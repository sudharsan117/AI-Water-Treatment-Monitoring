const express = require('express');
const router = express.Router();
const { getAlerts, acknowledgeAlert, resolveAlert } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAlerts);
router.put('/:id/acknowledge', protect, authorize('OPERATOR', 'ADMIN'), acknowledgeAlert);
router.put('/:id/resolve', protect, authorize('ADMIN'), resolveAlert);

module.exports = router;
