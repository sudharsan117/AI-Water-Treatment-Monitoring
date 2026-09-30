const express = require('express');
const router = express.Router();
const { getEquipment, createEquipment, updateEquipment } = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getEquipment);
router.post('/', protect, authorize('ADMIN'), createEquipment);
router.put('/:id', protect, authorize('ADMIN'), updateEquipment);

module.exports = router;
