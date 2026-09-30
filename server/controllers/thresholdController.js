const Threshold = require('../models/Threshold');
const logAuditAction = require('../utils/auditLogger');

const getThresholds = async (req, res, next) => {
  try {
    const { plantId } = req.query;
    const filter = plantId ? { plantId } : {};
    const thresholds = await Threshold.find(filter).populate('plantId', 'name');
    res.json(thresholds);
  } catch (error) {
    next(error);
  }
};

const updateThreshold = async (req, res, next) => {
  try {
    const { minimum, maximum, unit } = req.body;
    let threshold = await Threshold.findById(req.params.id);

    if (!threshold) {
      return res.status(404).json({ message: 'Threshold record not found' });
    }

    threshold.minimum = minimum !== undefined ? minimum : threshold.minimum;
    threshold.maximum = maximum !== undefined ? maximum : threshold.maximum;
    threshold.unit = unit || threshold.unit;
    threshold.updatedBy = req.user._id;
    threshold.updatedAt = new Date();

    await threshold.save();

    await logAuditAction({
      userId: req.user._id,
      action: 'THRESHOLD_CHANGED',
      entityType: 'Threshold',
      entityId: threshold._id,
      details: `Updated ${threshold.parameter} limits to [Min: ${threshold.minimum}, Max: ${threshold.maximum}]`,
      req
    });

    res.json(threshold);
  } catch (error) {
    next(error);
  }
};

const createThreshold = async (req, res, next) => {
  try {
    const threshold = await Threshold.create({
      ...req.body,
      updatedBy: req.user._id
    });
    res.status(201).json(threshold);
  } catch (error) {
    next(error);
  }
};

module.exports = { getThresholds, updateThreshold, createThreshold };
