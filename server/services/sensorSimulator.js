const Sensor = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');
const Equipment = require('../models/Equipment');
const Alert = require('../models/Alert');
const { checkReadingAnomaly, calculateEquipmentHealth } = require('./anomalyDetector');

let simulatorInterval = null;

// Base values for simulation parameters (used as fallback reference)
const currentValues = {
  pH: 7.35,
  Turbidity: 1.35,
  Chlorine: 1.65,
  Flow: 125,
  Pressure: 48.5
};

/**
 * Returns baseline target values and fluctuation noise for each sensor.
 * Maintains 80-90% HEALTHY/ONLINE sensors, 10-15% WARNING, and 1-2 CRITICAL.
 */
const getSensorBaseline = (sensor) => {
  if (sensor.name === 'West Bay pH Monitor') {
    // Intentionally CRITICAL sensor (pH = 9.35 exceeds critical max 8.5)
    return { base: 9.35, noise: 0.08 };
  }
  if (sensor.name === 'North Chlorine Analyzer') {
    // Intentionally WARNING sensor (Chlorine = 0.82 mg/L falls in warning range 0.5 - 1.0)
    return { base: 0.82, noise: 0.04 };
  }

  // HEALTHY / ONLINE sensors centering safely within normal limits
  switch (sensor.type) {
    case 'pH':
      return { base: 7.35, noise: 0.06 }; // Normal range 6.8 - 8.2
    case 'Turbidity':
      return { base: 1.35, noise: 0.12 }; // Normal range < 3.5 NTU
    case 'Chlorine':
      return { base: 1.65, noise: 0.08 }; // Normal range 1.0 - 2.5 mg/L
    case 'Flow':
      return { base: 125.0, noise: 2.5 }; // Normal range 70 - 180 GPM
    case 'Pressure':
      return { base: 48.5, noise: 1.2 }; // Normal range 30 - 70 PSI
    default:
      return { base: 7.0, noise: 0.1 };
  }
};

const runSimulationStep = async () => {
  try {
    const sensors = await Sensor.find({});
    if (!sensors || sensors.length === 0) return;

    for (const sensor of sensors) {
      const param = sensor.type;
      const { base, noise } = getSensorBaseline(sensor);

      // Realistic small fluctuation around fixed sensor baseline
      const fluctuation = (Math.random() - 0.5) * 2 * noise;
      let val = base + fluctuation;

      // Clamp values to realistic boundaries
      if (param === 'pH') val = Math.max(5.5, Math.min(10.5, val));
      if (param === 'Turbidity') val = Math.max(0.1, Math.min(10.0, val));
      if (param === 'Chlorine') val = Math.max(0.05, Math.min(4.5, val));
      if (param === 'Flow') val = Math.max(20, Math.min(220, val));
      if (param === 'Pressure') val = Math.max(10, Math.min(95, val));

      const finalVal = parseFloat(val.toFixed(2));
      currentValues[sensor._id] = finalVal;
      currentValues[param] = finalVal; // Reference for chart getters

      // Evaluate anomaly using project threshold logic
      const check = checkReadingAnomaly(param, finalVal);
      let quality = 'GOOD';
      if (check.status === 'WARNING') quality = 'FAIR';
      if (check.status === 'CRITICAL') quality = 'POOR';

      // Record reading in DB
      await SensorReading.create({
        sensorId: sensor._id,
        plantId: sensor.plantId,
        parameter: param,
        value: finalVal,
        quality,
        timestamp: new Date()
      });

      // Derive sensor status from threshold check
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
            message: `${sensor.name}: ${check.message}`,
            status: 'NEW',
            timestamp: new Date()
          });
        }
      }
    }

    // Equipment Telemetry Simulation:
    // Maintains demo distribution (6 Healthy/Operational, 1 Warning, 1 Critical)
    // DO NOT MODIFY - PRESERVES CORRECT EQUIPMENT HEALTH MODULE STATE
    const equipList = await Equipment.find({});
    if (equipList && equipList.length > 0) {
      for (const equip of equipList) {
        let newVib = equip.vibration;
        let newTemp = equip.temperature;

        if (equip.name.includes('Backwash Air Blower')) {
          // Intentionally CRITICAL equipment (High vibration & overheating)
          newVib = parseFloat((5.2 + (Math.random() - 0.5) * 0.3).toFixed(2));
          newTemp = parseFloat((84.5 + (Math.random() - 0.5) * 1.5).toFixed(1));
        } else if (equip.name.includes('Clearwell Booster Pump')) {
          // Intentionally WARNING equipment (Elevated vibration & temperature)
          newVib = parseFloat((3.1 + (Math.random() - 0.5) * 0.2).toFixed(2));
          newTemp = parseFloat((68.0 + (Math.random() - 0.5) * 1.2).toFixed(1));
        } else {
          // HEALTHY / OPERATIONAL equipment (Low normal vibration & temperature)
          const baseVib = equip.name.includes('Mixer') ? 0.8 : (equip.name.includes('Dosing') ? 1.1 : 0.6);
          const baseTemp = equip.name.includes('Mixer') ? 52.0 : (equip.name.includes('Metering') ? 49.5 : 46.5);
          newVib = parseFloat(Math.max(0.3, Math.min(1.8, baseVib + (Math.random() - 0.5) * 0.1)).toFixed(2));
          newTemp = parseFloat(Math.max(38.0, Math.min(58.0, baseTemp + (Math.random() - 0.5) * 0.8)).toFixed(1));
        }

        // Calculate health score and status dynamically from telemetry thresholds
        const { healthScore, status } = calculateEquipmentHealth(newVib, newTemp);

        await Equipment.findByIdAndUpdate(equip._id, {
          vibration: newVib,
          temperature: newTemp,
          healthScore,
          status
        });

        // Trigger alert for abnormal equipment if no NEW alert exists
        if (status !== 'OPERATIONAL') {
          const existingEquipAlert = await Alert.findOne({
            equipmentId: equip._id,
            status: 'NEW'
          });

          if (!existingEquipAlert) {
            await Alert.create({
              plantId: equip.plantId,
              equipmentId: equip._id,
              severity: status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
              type: 'EQUIPMENT_HEALTH',
              message: `${equip.name} exhibits ${status.toLowerCase()} telemetry (Vibration: ${newVib} mm/s, Temp: ${newTemp}°C). Prototype Health Score: ${healthScore}%.`,
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
  currentValues,
  getSensorBaseline
};
