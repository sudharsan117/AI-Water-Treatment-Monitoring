const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacityMGD: { type: Number, default: 10 },
  status: { type: String, enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plant', plantSchema);
