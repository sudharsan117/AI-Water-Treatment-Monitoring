const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },
  severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
  type: { type: String, required: true }, // ANOMALY, THRESHOLD_EXCEEDED, EQUIPMENT_HEALTH
  message: { type: String, required: true },
  status: { type: String, enum: ['NEW', 'ACKNOWLEDGED', 'RESOLVED'], default: 'NEW' },
  timestamp: { type: Date, default: Date.now },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
});

alertSchema.index({ plantId: 1, status: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', alertSchema);
