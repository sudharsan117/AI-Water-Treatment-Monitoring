const Equipment = require('../models/Equipment');
const logAuditAction = require('../utils/auditLogger');

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
    const item = await Equipment.create(req.body);
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
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
