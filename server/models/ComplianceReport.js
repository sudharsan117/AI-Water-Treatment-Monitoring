const mongoose = require('mongoose');

const complianceReportSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  reportType: { 
    type: String, 
    enum: ['WEEKLY', 'DAILY_WATER_QUALITY', 'EQUIPMENT_HEALTH', 'CHEMICAL_USAGE', 'PLANT_OPERATIONS', 'MONTHLY', 'CUSTOM'], 
    default: 'WEEKLY' 
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filePath: { type: String },
  summaryData: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);
