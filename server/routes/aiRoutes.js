const express = require('express');
const router = express.Router();
const { getDoseRec, getModelStatus, handleDoseDecision, getDoseHistory } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dose-recommendation', protect, getDoseRec);
router.get('/model-status', protect, getModelStatus);
router.get('/dose-history', protect, getDoseHistory);
router.post('/dose-decision', protect, authorize('OPERATOR', 'ADMIN'), handleDoseDecision);

module.exports = router;
