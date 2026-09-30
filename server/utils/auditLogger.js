const AuditLog = require('../models/AuditLog');

const logAuditAction = async ({ userId, action, entityType, entityId, details, req }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'SYSTEM';
    await AuditLog.create({
      userId: userId || null,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      details: details || '',
      ipAddress,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = logAuditAction;
