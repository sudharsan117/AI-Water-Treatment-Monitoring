const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g. Pump, Mixer, Filter, Dosing Pump
  status: { type: String, enum: ['OPERATIONAL', 'WARNING', 'CRITICAL', 'MAINTENANCE'], default: 'OPERATIONAL' },
  healthScore: { type: Number, default: 100 }, // 0 to 100
  vibration: { type: Number, default: 0.5 }, // mm/s
  temperature: { type: Number, default: 45.0 }, // °C
  runtimeHours: { type: Number, default: 1200 },
  lastMaintenance: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
