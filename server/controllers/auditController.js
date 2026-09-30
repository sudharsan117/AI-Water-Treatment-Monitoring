const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await AuditLog.find({})
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
