const Plant = require('../models/Plant');
const logAuditAction = require('../utils/auditLogger');

const getPlants = async (req, res, next) => {
  try {
    const plants = await Plant.find({}).sort({ createdAt: -1 });
    res.json(plants);
  } catch (error) {
    next(error);
  }
};

const getPlantById = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    res.json(plant);
  } catch (error) {
    next(error);
  }
};

const createPlant = async (req, res, next) => {
  try {
    const { name, location, capacityMGD, status } = req.body;
    const plant = await Plant.create({ name, location, capacityMGD, status });
    
    await logAuditAction({
      userId: req.user._id,
      action: 'PLANT_CREATED',
      entityType: 'Plant',
      entityId: plant._id,
      details: `Created plant ${plant.name}`,
      req
    });

    res.status(201).json(plant);
  } catch (error) {
    next(error);
  }
};

const updatePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plant) return res.status(404).json({ message: 'Plant not found' });

    await logAuditAction({
      userId: req.user._id,
      action: 'PLANT_UPDATED',
      entityType: 'Plant',
      entityId: plant._id,
      details: `Updated plant ${plant.name}`,
      req
    });

    res.json(plant);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlants, getPlantById, createPlant, updatePlant };
