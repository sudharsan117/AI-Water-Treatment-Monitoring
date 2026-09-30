const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['pH', 'Turbidity', 'Chlorine', 'Flow', 'Pressure'], required: true },
  location: { type: String, required: true },
  unit: { type: String, required: true },
  status: { type: String, enum: ['ONLINE', 'OFFLINE', 'WARNING', 'CRITICAL'], default: 'ONLINE' },
  lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sensor', sensorSchema);
