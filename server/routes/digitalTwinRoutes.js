const express = require('express');
const router = express.Router();
const { runSimulate, getSimHistory } = require('../controllers/digitalTwinController');
const { protect } = require('../middleware/authMiddleware');

router.post('/simulate', protect, runSimulate);
router.get('/history', protect, getSimHistory);

module.exports = router;
