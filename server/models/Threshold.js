const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  parameter: { type: String, enum: ['pH', 'Turbidity', 'Chlorine', 'Flow', 'Pressure', 'Vibration', 'Temperature'], required: true },
  minimum: { type: Number, required: true },
  maximum: { type: Number, required: true },
  unit: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Threshold', thresholdSchema);
