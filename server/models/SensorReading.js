const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: true },
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  parameter: { type: String, enum: ['pH', 'Turbidity', 'Chlorine', 'Flow', 'Pressure'] },
  value: { type: Number, required: true },
  quality: { type: String, enum: ['GOOD', 'FAIR', 'POOR'], default: 'GOOD' },
  timestamp: { type: Date, default: Date.now }
});

sensorReadingSchema.index({ sensorId: 1, timestamp: -1 });
sensorReadingSchema.index({ plantId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
