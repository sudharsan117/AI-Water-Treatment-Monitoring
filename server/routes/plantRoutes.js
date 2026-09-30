const express = require('express');
const router = express.Router();
const { getPlants, getPlantById, createPlant, updatePlant } = require('../controllers/plantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getPlants);
router.get('/:id', protect, getPlantById);
router.post('/', protect, authorize('ADMIN'), createPlant);
router.put('/:id', protect, authorize('ADMIN'), updatePlant);

module.exports = router;
