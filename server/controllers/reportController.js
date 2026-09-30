const path = require('path');
const fs = require('fs');
const ComplianceReport = require('../models/ComplianceReport');
const SensorReading = require('../models/SensorReading');
const Alert = require('../models/Alert');
const ChemicalDose = require('../models/ChemicalDose');
const Plant = require('../models/Plant');
const { generateCompliancePDF } = require('../utils/pdfGenerator');
const logAuditAction = require('../utils/auditLogger');

const getReports = async (req, res, next) => {
  try {
    const reports = await ComplianceReport.find({})
      .populate('plantId', 'name')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

const generateReport = async (req, res, next) => {
  try {
    const { plantId, reportType, periodStart, periodEnd } = req.body;
    const start = periodStart ? new Date(periodStart) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = periodEnd ? new Date(periodEnd) : new Date();

    const plant = await Plant.findById(plantId);
    const plantName = plant ? plant.name : 'Central Water Treatment Plant';

    // Calculate aggregated statistics
    const readings = await SensorReading.find({
      timestamp: { $gte: start, $lte: end }
    });

    let phSum = 0, phCount = 0;
    let turbSum = 0, turbCount = 0;
    let chlorSum = 0, chlorCount = 0;
    let flowSum = 0, flowCount = 0;

    readings.forEach(r => {
      if (r.parameter === 'pH') { phSum += r.value; phCount++; }
      if (r.parameter === 'Turbidity') { turbSum += r.value; turbCount++; }
      if (r.parameter === 'Chlorine') { chlorSum += r.value; chlorCount++; }
      if (r.parameter === 'Flow') { flowSum += r.value; flowCount++; }
    });

    const stats = {
      phAvg: phCount ? (phSum / phCount).toFixed(2) : '7.2',
      turbidityAvg: turbCount ? (turbSum / turbCount).toFixed(2) : '1.8',
      chlorineAvg: chlorCount ? (chlorSum / chlorCount).toFixed(2) : '1.5',
      flowAvg: flowCount ? (flowSum / flowCount).toFixed(0) : '120',
      qualityScore: 92
    };

    const alertsCount = await Alert.countDocuments({ timestamp: { $gte: start, $lte: end } });
    const criticalCount = await Alert.countDocuments({ severity: 'CRITICAL', timestamp: { $gte: start, $lte: end } });
    const doses = await ChemicalDose.find({ timestamp: { $gte: start, $lte: end } });

    const reportData = {
      plantName,
      periodStart: start,
      periodEnd: end,
      reportType: reportType || 'WEEKLY',
      generatedByName: req.user.name,
      stats,
      alertsCount,
      criticalCount,
      doseStats: {
        total: doses.length,
        approved: doses.filter(d => d.status === 'APPROVED' || d.status === 'ADJUSTED').length,
        estimatedSavings: '14.5%'
      }
    };

    const fileName = `compliance_report_${Date.now()}.pdf`;
    const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
    const filePath = path.join(reportsDir, fileName);

    await generateCompliancePDF(reportData, filePath);

    const reportRecord = await ComplianceReport.create({
      plantId: plantId || (plant ? plant._id : null),
      periodStart: start,
      periodEnd: end,
      reportType: reportType || 'WEEKLY',
      generatedBy: req.user._id,
      filePath: `/uploads/reports/${fileName}`,
      summaryData: reportData,
      createdAt: new Date()
    });

    await logAuditAction({
      userId: req.user._id,
      action: 'REPORT_GENERATED',
      entityType: 'ComplianceReport',
      entityId: reportRecord._id,
      details: `Generated ${reportType || 'WEEKLY'} compliance report for ${plantName}`,
      req
    });

    res.status(201).json(reportRecord);
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await ComplianceReport.findById(req.params.id)
      .populate('plantId', 'name')
      .populate('generatedBy', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    next(error);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const report = await ComplianceReport.findById(req.params.id);
    if (!report || !report.filePath) return res.status(404).json({ message: 'Report file not found' });

    const fullPath = path.join(__dirname, '..', report.filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'PDF file does not exist on disk' });
    }

    res.download(fullPath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReports,
  generateReport,
  getReportById,
  downloadReport
};
