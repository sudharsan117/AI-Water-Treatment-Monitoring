const Sensor = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');
const Equipment = require('../models/Equipment');
const Alert = require('../models/Alert');
const { checkReadingAnomaly } = require('./anomalyDetector');

let simulatorInterval = null;

// Base values for simulation parameters
const currentValues = {
  pH: 7.2,
  Turbidity: 1.8,
  Chlorine: 1.4,
  Flow: 125,
  Pressure: 45
};

const runSimulationStep = async () => {
  try {
    const sensors = await Sensor.find({});
    if (!sensors || sensors.length === 0) return;

    // 5% chance of triggering a random simulated anomaly step
    const triggerAnomaly = Math.random() < 0.05;
    const anomalyType = Math.floor(Math.random() * 5);

    for (const sensor of sensors) {
      let param = sensor.type;
      let val = currentValues[param] || 7.0;

      // Small random walk variation (-2% to +2%)
      const variation = (Math.random() - 0.48) * 0.04 * val;
      val = val + variation;

      if (triggerAnomaly) {
        if (param === 'Chlorine' && anomalyType === 0) {
          val = Math.max(0.3, val - 0.8); // Chlorine drop anomaly
        } else if (param === 'Turbidity' && anomalyType === 1) {
          val = val + 2.5; // Turbidity spike anomaly
        } else if (param === 'Pressure' && anomalyType === 2) {
          val = Math.max(15, val - 20); // Pressure drop anomaly
        } else if (param === 'Flow' && anomalyType === 3) {
          val = Math.max(40, val - 35); // Flow decrease anomaly
        } else if (param === 'pH' && anomalyType === 4) {
          val = val > 7 ? val + 1.2 : val - 1.2; // pH anomaly
        }
      }

      // Clamp values to realistic boundaries
      if (param === 'pH') val = Math.max(5.5, Math.min(9.5, val));
      if (param === 'Turbidity') val = Math.max(0.2, Math.min(10.0, val));
      if (param === 'Chlorine') val = Math.max(0.1, Math.min(4.5, val));
      if (param === 'Flow') val = Math.max(20, Math.min(220, val));
      if (param === 'Pressure') val = Math.max(10, Math.min(95, val));

      // Update in-memory reference
      currentValues[param] = parseFloat(val.toFixed(2));

      // Check anomaly
      const check = checkReadingAnomaly(param, currentValues[param]);
      let quality = 'GOOD';
      if (check.status === 'WARNING') quality = 'FAIR';
      if (check.status === 'CRITICAL') quality = 'POOR';

      // Record reading in DB
      await SensorReading.create({
        sensorId: sensor._id,
        plantId: sensor.plantId,
        parameter: param,
        value: currentValues[param],
        quality,
        timestamp: new Date()
      });

      // Update sensor status and lastSeen
      let sensorStatus = 'ONLINE';
      if (check.status === 'CRITICAL') sensorStatus = 'CRITICAL';
      else if (check.status === 'WARNING') sensorStatus = 'WARNING';

      await Sensor.findByIdAndUpdate(sensor._id, {
        status: sensorStatus,
        lastSeen: new Date()
      });

      // If warning/critical, check if recent unresolved alert exists; if not, create Alert
      if (check.status !== 'NORMAL') {
        const existingAlert = await Alert.findOne({
          sensorId: sensor._id,
          status: 'NEW'
        });

        if (!existingAlert) {
          await Alert.create({
            plantId: sensor.plantId,
            sensorId: sensor._id,
            severity: check.severity,
            type: 'ANOMALY_DETECTION',
            message: check.message,
            status: 'NEW',
            timestamp: new Date()
          });
        }
      }
    }

    // Also update equipment health occasionally
    if (triggerAnomaly) {
      const equipList = await Equipment.find({});
      if (equipList && equipList.length > 0) {
        const targetEquip = equipList[Math.floor(Math.random() * equipList.length)];
        const isVibAnomaly = Math.random() > 0.5;
        
        let newVib = targetEquip.vibration;
        let newTemp = targetEquip.temperature;
        let healthScore = targetEquip.healthScore;
        let status = targetEquip.status;

        if (isVibAnomaly) {
          newVib = parseFloat((newVib + 1.8).toFixed(2));
          healthScore = Math.max(25, healthScore - 20);
          status = healthScore < 50 ? 'CRITICAL' : 'WARNING';
        } else {
          newTemp = parseFloat((newTemp + 15).toFixed(1));
          healthScore = Math.max(30, healthScore - 15);
          status = healthScore < 50 ? 'CRITICAL' : 'WARNING';
        }

        await Equipment.findByIdAndUpdate(targetEquip._id, {
          vibration: newVib,
          temperature: newTemp,
          healthScore,
          status
        });

        if (status !== 'OPERATIONAL') {
          const existingEquipAlert = await Alert.findOne({
            equipmentId: targetEquip._id,
            status: 'NEW'
          });

          if (!existingEquipAlert) {
            await Alert.create({
              plantId: targetEquip.plantId,
              equipmentId: targetEquip._id,
              severity: status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
              type: 'EQUIPMENT_HEALTH',
              message: `${targetEquip.name} exhibits abnormal ${isVibAnomaly ? 'vibration (' + newVib + ' mm/s)' : 'temperature (' + newTemp + '°C)'}. Health score: ${healthScore}%.`,
              status: 'NEW',
              timestamp: new Date()
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('Simulator step error:', error.message);
  }
};

const startSimulator = (intervalMs = 4000) => {
  if (simulatorInterval) clearInterval(simulatorInterval);
  console.log(`Starting Sensor Simulator (polling interval: ${intervalMs}ms)...`);
  simulatorInterval = setInterval(runSimulationStep, intervalMs);
};

const stopSimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
    console.log('Sensor Simulator stopped.');
  }
};

module.exports = {
  startSimulator,
  stopSimulator,
  runSimulationStep,
  currentValues
};
