const { runDigitalTwinSimulation } = require('../services/digitalTwinEngine');
const DigitalTwinSimulation = require('../models/DigitalTwinSimulation');
const logAuditAction = require('../utils/auditLogger');

// @desc Run what-if digital twin simulation
// @route POST /api/digital-twin/simulate
const runSimulate = async (req, res, next) => {
  try {
    const { plantId, pH, turbidity, chlorine, flow, pressure, chemicalDose } = req.body;

    const result = runDigitalTwinSimulation({ pH, turbidity, chlorine, flow, pressure, chemicalDose });

    const simulation = await DigitalTwinSimulation.create({
      plantId: plantId || req.body.plantId,
      inputParameters: result.inputParameters,
      chemicalDose: result.chemicalDose,
      predictedOutput: result.predictedOutput,
      waterQualityScore: result.waterQualityScore,
      recommendation: result.recommendation,
      createdBy: req.user._id,
      timestamp: new Date()
    });

    await logAuditAction({
      userId: req.user._id,
      action: 'SIMULATION_RUN',
      entityType: 'DigitalTwinSimulation',
      entityId: simulation._id,
      details: `Ran Digital Twin what-if simulation with chemical dose ${chemicalDose} mg/L. Predicted quality score: ${result.waterQualityScore}`,
      req
    });

    res.status(201).json(simulation);
  } catch (error) {
    next(error);
  }
};

// @desc Get simulation history
// @route GET /api/digital-twin/history
const getSimHistory = async (req, res, next) => {
  try {
    const history = await DigitalTwinSimulation.find({})
      .populate('plantId', 'name')
      .populate('createdBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(30);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = { runSimulate, getSimHistory };
