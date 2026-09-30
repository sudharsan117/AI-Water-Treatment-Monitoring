const Sensor = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');
const logAuditAction = require('../utils/auditLogger');

const getSensors = async (req, res, next) => {
  try {
    const { plantId } = req.query;
    const filter = plantId ? { plantId } : {};
    const sensors = await Sensor.find(filter).populate('plantId', 'name');
    res.json(sensors);
  } catch (error) {
    next(error);
  }
};

const createSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.create(req.body);
    await logAuditAction({
      userId: req.user._id,
      action: 'SENSOR_CREATED',
      entityType: 'Sensor',
      entityId: sensor._id,
      details: `Created sensor ${sensor.name}`,
      req
    });
    res.status(201).json(sensor);
  } catch (error) {
    next(error);
  }
};

const updateSensor = async (req, res, next) => {
  try {
    const sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sensor) return res.status(404).json({ message: 'Sensor not found' });
    await logAuditAction({
      userId: req.user._id,
      action: 'SENSOR_UPDATED',
      entityType: 'Sensor',
      entityId: sensor._id,
      details: `Updated sensor ${sensor.name}`,
      req
    });
    res.json(sensor);
  } catch (error) {
    next(error);
  }
};

const getSensorReadings = async (req, res, next) => {
  try {
    const { sensorId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const readings = await SensorReading.find({ sensorId })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(readings.reverse()); // Chronological order for charts
  } catch (error) {
    next(error);
  }
};

const getLatestReadings = async (req, res, next) => {
  try {
    const { plantId } = req.query;
    const filter = plantId ? { plantId } : {};
    const sensors = await Sensor.find(filter);

    const latest = await Promise.all(
      sensors.map(async (sensor) => {
        const reading = await SensorReading.findOne({ sensorId: sensor._id })
          .sort({ timestamp: -1 });
        return {
          sensor,
          latestReading: reading || { value: 0, quality: 'GOOD', timestamp: new Date() }
        };
      })
    );

    res.json(latest);
  } catch (error) {
    next(error);
  }
};

const recordReading = async (req, res, next) => {
  try {
    const reading = await SensorReading.create(req.body);
    res.status(201).json(reading);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSensors,
  createSensor,
  updateSensor,
  getSensorReadings,
  getLatestReadings,
  recordReading
};
