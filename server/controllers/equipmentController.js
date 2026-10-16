const Equipment = require('../models/Equipment');
const logAuditAction = require('../utils/auditLogger');
const { calculateEquipmentHealth } = require('../services/anomalyDetector');

const getEquipment = async (req, res, next) => {
  try {
    const { plantId } = req.query;
    const filter = plantId ? { plantId } : {};
    const equipment = await Equipment.find(filter).populate('plantId', 'name');
    res.json(equipment);
  } catch (error) {
    next(error);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const { vibration, temperature } = req.body;
    const { healthScore, status } = calculateEquipmentHealth(vibration, temperature);
    
    const item = await Equipment.create({
      ...req.body,
      healthScore: req.body.healthScore !== undefined ? req.body.healthScore : healthScore,
      status: req.body.status || status
    });

    await logAuditAction({
      userId: req.user._id,
      action: 'EQUIPMENT_CREATED',
      entityType: 'Equipment',
      entityId: item._id,
      details: `Created equipment ${item.name}`,
      req
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    let updateData = { ...req.body };
    if (updateData.vibration !== undefined || updateData.temperature !== undefined) {
      const current = await Equipment.findById(req.params.id);
      const vib = updateData.vibration !== undefined ? updateData.vibration : current.vibration;
      const temp = updateData.temperature !== undefined ? updateData.temperature : current.temperature;
      const computed = calculateEquipmentHealth(vib, temp);
      if (updateData.healthScore === undefined) updateData.healthScore = computed.healthScore;
      if (updateData.status === undefined) updateData.status = computed.status;
    }

    const item = await Equipment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!item) return res.status(404).json({ message: 'Equipment not found' });
    await logAuditAction({
      userId: req.user._id,
      action: 'EQUIPMENT_UPDATED',
      entityType: 'Equipment',
      entityId: item._id,
      details: `Updated equipment ${item.name}`,
      req
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

module.exports = { getEquipment, createEquipment, updateEquipment };
