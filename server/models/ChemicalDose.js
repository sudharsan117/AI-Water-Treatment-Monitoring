const mongoose = require('mongoose');

const chemicalDoseSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  chemical: { type: String, default: 'Chlorine' },
  currentValue: { type: Number, required: true }, // e.g. 1.2 mg/L
  recommendedDose: { type: Number, required: true }, // e.g. 2.1 mg/L
  approvedDose: { type: Number },
  confidence: { type: Number, required: true }, // e.g. 92%
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'ADJUSTED', 'REJECTED'], default: 'PENDING' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChemicalDose', chemicalDoseSchema);
