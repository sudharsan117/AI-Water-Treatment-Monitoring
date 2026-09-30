const mongoose = require('mongoose');

const digitalTwinSimulationSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  inputParameters: {
    pH: { type: Number, required: true },
    turbidity: { type: Number, required: true },
    chlorine: { type: Number, required: true },
    flow: { type: Number, required: true },
    pressure: { type: Number, required: true }
  },
  chemicalDose: { type: Number, required: true }, // Chlorine dose addition
  predictedOutput: {
    predictedTurbidity: { type: Number },
    predictedChlorine: { type: Number },
    predictedPH: { type: Number },
    waterQualityScore: { type: Number },
    feedback: { type: String }
  },
  waterQualityScore: { type: Number },
  recommendation: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DigitalTwinSimulation', digitalTwinSimulationSchema);
