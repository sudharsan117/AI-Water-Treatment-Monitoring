const express = require('express');
const router = express.Router();
const { getReports, generateReport, getReportById, downloadReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getReports);
router.post('/generate', protect, generateReport);
router.get('/:id', protect, getReportById);
router.get('/:id/download', protect, downloadReport);

module.exports = router;
