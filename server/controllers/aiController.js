const { getDoseRecommendation } = require('../services/aiRecommendationEngine');
const { currentValues } = require('../services/sensorSimulator');
const ChemicalDose = require('../models/ChemicalDose');
const logAuditAction = require('../utils/auditLogger');

// @desc Get AI Dose Recommendation based on live parameters or query params
// @route GET /api/ai/dose-recommendation
const getDoseRec = async (req, res, next) => {
  try {
    const params = {
      pH: parseFloat(req.query.pH) || currentValues.pH || 7.2,
      turbidity: parseFloat(req.query.turbidity) || currentValues.Turbidity || 1.8,
      chlorine: parseFloat(req.query.chlorine) || currentValues.Chlorine || 1.2,
      flow: parseFloat(req.query.flow) || currentValues.Flow || 125,
      pressure: parseFloat(req.query.pressure) || currentValues.Pressure || 45
    };

    const recommendation = getDoseRecommendation(params);
    res.json(recommendation);
  } catch (error) {
    next(error);
  }
};

// @desc Get AI model status & metrics
// @route GET /api/ai/model-status
const getModelStatus = async (req, res, next) => {
  try {
    res.json({
      modelName: 'WaterDose-RuleEngine v2.4 (Prototype)',
      type: 'Statistical Rule-Based Optimization Engine',
      accuracyRating: '96.2% (Simulated Validation Benchmark)',
      status: 'ONLINE & OPERATIONAL',
      lastTrained: '2026-09-01',
      monitoredParameters: ['pH', 'Turbidity', 'Chlorine Residual', 'Flow Rate', 'Pressure']
    });
  } catch (error) {
    next(error);
  }
};

// @desc Handle Dose Approval / Adjustment / Rejection by Operator
// @route POST /api/ai/dose-decision
const handleDoseDecision = async (req, res, next) => {
  try {
    const { plantId, chemical, currentValue, recommendedDose, approvedDose, confidence, reason, status } = req.body;

    const chemicalDose = await ChemicalDose.create({
      plantId,
      chemical: chemical || 'Chlorine',
      currentValue,
      recommendedDose,
      approvedDose: status === 'APPROVED' ? recommendedDose : approvedDose,
      confidence,
      reason,
      status, // 'APPROVED', 'ADJUSTED', 'REJECTED'
      createdBy: req.user._id,
      approvedBy: status !== 'REJECTED' ? req.user._id : null,
      timestamp: new Date()
    });

    const auditAction = status === 'APPROVED' ? 'DOSE_APPROVED' : (status === 'ADJUSTED' ? 'DOSE_ADJUSTED' : 'DOSE_REJECTED');

    await logAuditAction({
      userId: req.user._id,
      action: auditAction,
      entityType: 'ChemicalDose',
      entityId: chemicalDose._id,
      details: `${req.user.name} ${status.toLowerCase()} chemical dose of ${chemicalDose.approvedDose || recommendedDose} mg/L (Recommended: ${recommendedDose} mg/L)`,
      req
    });

    res.status(201).json(chemicalDose);
  } catch (error) {
    next(error);
  }
};

// @desc Get historical dose decisions
// @route GET /api/ai/dose-history
const getDoseHistory = async (req, res, next) => {
  try {
    const history = await ChemicalDose.find({})
      .populate('plantId', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoseRec,
  getModelStatus,
  handleDoseDecision,
  getDoseHistory
};
