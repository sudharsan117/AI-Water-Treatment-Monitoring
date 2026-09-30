const Alert = require('../models/Alert');
const logAuditAction = require('../utils/auditLogger');

const getAlerts = async (req, res, next) => {
  try {
    const { status, severity, plantId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (plantId) filter.plantId = plantId;

    const alerts = await Alert.find(filter)
      .populate('plantId', 'name')
      .populate('sensorId', 'name type')
      .populate('equipmentId', 'name type')
      .populate('acknowledgedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ timestamp: -1 });

    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

const acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = req.user._id;
    alert.acknowledgedAt = new Date();
    await alert.save();

    await logAuditAction({
      userId: req.user._id,
      action: 'ALERT_ACKNOWLEDGED',
      entityType: 'Alert',
      entityId: alert._id,
      details: `Acknowledged alert: ${alert.message}`,
      req
    });

    res.json(alert);
  } catch (error) {
    next(error);
  }
};

const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    alert.status = 'RESOLVED';
    alert.resolvedBy = req.user._id;
    alert.resolvedAt = new Date();
    await alert.save();

    await logAuditAction({
      userId: req.user._id,
      action: 'ALERT_RESOLVED',
      entityType: 'Alert',
      entityId: alert._id,
      details: `Resolved alert: ${alert.message}`,
      req
    });

    res.json(alert);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, acknowledgeAlert, resolveAlert };
