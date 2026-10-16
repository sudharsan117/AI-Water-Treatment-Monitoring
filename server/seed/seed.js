require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const User = require('../models/User');
const Plant = require('../models/Plant');
const Sensor = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');
const Equipment = require('../models/Equipment');
const Alert = require('../models/Alert');
const ChemicalDose = require('../models/ChemicalDose');
const AuditLog = require('../models/AuditLog');
const DigitalTwinSimulation = require('../models/DigitalTwinSimulation');
const Threshold = require('../models/Threshold');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/water_treatment_db';
    console.log('Connecting to MongoDB for seeding...', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Plant.deleteMany({});
    await Sensor.deleteMany({});
    await SensorReading.deleteMany({});
    await Equipment.deleteMany({});
    await Alert.deleteMany({});
    await ChemicalDose.deleteMany({});
    await AuditLog.deleteMany({});
    await DigitalTwinSimulation.deleteMany({});
    await Threshold.deleteMany({});

    console.log('Creating Demo Users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'ADMIN',
      active: true
    });

    const operatorUser = await User.create({
      name: 'Alex Rivera (Lead Operator)',
      email: 'operator@example.com',
      password: 'password123',
      role: 'OPERATOR',
      active: true
    });

    const auditorUser = await User.create({
      name: 'Dr. Sarah Chen (Compliance Auditor)',
      email: 'auditor@example.com',
      password: 'password123',
      role: 'AUDITOR',
      active: true
    });

    console.log('Creating Plants...');
    const plant1 = await Plant.create({
      name: 'Central Municipal Water Treatment Plant',
      location: 'Sector 4, Metropolitan District',
      capacityMGD: 25,
      status: 'ACTIVE'
    });

    const plant2 = await Plant.create({
      name: 'Northside Purification Facility',
      location: 'North Valley Industrial Park',
      capacityMGD: 15,
      status: 'ACTIVE'
    });

    const plant3 = await Plant.create({
      name: 'West Bay Reclamation Plant',
      location: 'West Bay Coastal Zone',
      capacityMGD: 10,
      status: 'MAINTENANCE'
    });

    console.log('Creating Sensors (10 ONLINE, 1 WARNING, 1 CRITICAL)...');
    const sensorsData = [
      { plantId: plant1._id, name: 'pH Sensor Alpha', type: 'pH', location: 'Clarifier Intake', unit: 'pH', status: 'ONLINE' },
      { plantId: plant1._id, name: 'Turbidity Sensor Beta', type: 'Turbidity', location: 'Post-Flocculation', unit: 'NTU', status: 'ONLINE' },
      { plantId: plant1._id, name: 'Residual Chlorine Sensor', type: 'Chlorine', location: 'Clearwell Outlet', unit: 'mg/L', status: 'ONLINE' },
      { plantId: plant1._id, name: 'Main Inflow Meter', type: 'Flow', location: 'Primary Intake Header', unit: 'GPM', status: 'ONLINE' },
      { plantId: plant1._id, name: 'Distribution Line Pressure', type: 'Pressure', location: 'High Lift Discharge', unit: 'PSI', status: 'ONLINE' },
      
      { plantId: plant2._id, name: 'North Intake pH', type: 'pH', location: 'Reservoir Intake', unit: 'pH', status: 'ONLINE' },
      { plantId: plant2._id, name: 'North Turbidity Meter', type: 'Turbidity', location: 'Filter Gallery', unit: 'NTU', status: 'ONLINE' },
      { plantId: plant2._id, name: 'North Chlorine Analyzer', type: 'Chlorine', location: 'Disinfection Tank', unit: 'mg/L', status: 'WARNING' },
      { plantId: plant2._id, name: 'North Flow Rate Sensor', type: 'Flow', location: 'Main Pipe A', unit: 'GPM', status: 'ONLINE' },
      { plantId: plant2._id, name: 'North Main Pressure Gauge', type: 'Pressure', location: 'Pump Output', unit: 'PSI', status: 'ONLINE' },

      { plantId: plant3._id, name: 'West Bay pH Monitor', type: 'pH', location: 'Reclamation Feed', unit: 'pH', status: 'CRITICAL' },
      { plantId: plant3._id, name: 'West Bay Turbidity Monitor', type: 'Turbidity', location: 'Sand Filter Outlet', unit: 'NTU', status: 'ONLINE' }
    ];

    const sensors = await Sensor.insertMany(sensorsData);

    console.log('Creating Thresholds...');
    const thresholdsData = [
      { plantId: plant1._id, parameter: 'pH', minimum: 6.5, maximum: 8.5, unit: 'pH', updatedBy: adminUser._id },
      { plantId: plant1._id, parameter: 'Turbidity', minimum: 0.1, maximum: 4.0, unit: 'NTU', updatedBy: adminUser._id },
      { plantId: plant1._id, parameter: 'Chlorine', minimum: 1.0, maximum: 3.0, unit: 'mg/L', updatedBy: adminUser._id },
      { plantId: plant1._id, parameter: 'Flow', minimum: 50, maximum: 200, unit: 'GPM', updatedBy: adminUser._id },
      { plantId: plant1._id, parameter: 'Pressure', minimum: 30, maximum: 75, unit: 'PSI', updatedBy: adminUser._id }
    ];
    await Threshold.insertMany(thresholdsData);

    console.log('Creating Equipment (Preserving Healthy / Operational Demo State)...');
    const equipmentData = [
      { plantId: plant1._id, name: 'Raw Water Intake Pump 101', type: 'Intake Pump', status: 'OPERATIONAL', healthScore: 94, vibration: 0.6, temperature: 46.5, runtimeHours: 2450 },
      { plantId: plant1._id, name: 'High-Speed Flocculation Mixer', type: 'Mixer', status: 'OPERATIONAL', healthScore: 92, vibration: 0.8, temperature: 52.0, runtimeHours: 1890 },
      { plantId: plant1._id, name: 'Primary Chlorine Dosing Pump', type: 'Dosing Pump', status: 'OPERATIONAL', healthScore: 90, vibration: 1.1, temperature: 50.0, runtimeHours: 3120 },
      { plantId: plant1._id, name: 'Clearwell Booster Pump 3', type: 'Booster Pump', status: 'WARNING', healthScore: 70, vibration: 3.1, temperature: 68.0, runtimeHours: 4890 },
      { plantId: plant1._id, name: 'Rapid Sand Filter Actuator A', type: 'Filter System', status: 'OPERATIONAL', healthScore: 95, vibration: 0.4, temperature: 42.0, runtimeHours: 1100 },
      
      { plantId: plant2._id, name: 'Northside Main Feed Pump', type: 'Intake Pump', status: 'OPERATIONAL', healthScore: 91, vibration: 0.7, temperature: 48.0, runtimeHours: 1540 },
      { plantId: plant2._id, name: 'Coagulant Metering Unit', type: 'Dosing Unit', status: 'OPERATIONAL', healthScore: 88, vibration: 1.0, temperature: 49.5, runtimeHours: 980 },
      { plantId: plant2._id, name: 'Backwash Air Blower 2', type: 'Blower', status: 'CRITICAL', healthScore: 35, vibration: 5.2, temperature: 84.5, runtimeHours: 2780 }
    ];
    const equipmentList = await Equipment.insertMany(equipmentData);

    console.log('Generating Historical Sensor Readings (past 24h)...');
    const readings = [];
    const now = Date.now();
    const intervalMs = 15 * 60 * 1000; // 15 mins
    const steps = 96; // 24 hours

    for (let i = steps; i >= 0; i--) {
      const timestamp = new Date(now - i * intervalMs);
      
      sensors.forEach(sensor => {
        let baseVal = 7.35;
        let noiseAmp = 0.05;

        if (sensor.name === 'West Bay pH Monitor') {
          baseVal = 9.35;
          noiseAmp = 0.08;
        } else if (sensor.name === 'North Chlorine Analyzer') {
          baseVal = 0.82;
          noiseAmp = 0.04;
        } else {
          if (sensor.type === 'Turbidity') { baseVal = 1.35; noiseAmp = 0.10; }
          if (sensor.type === 'Chlorine') { baseVal = 1.65; noiseAmp = 0.08; }
          if (sensor.type === 'Flow') { baseVal = 125; noiseAmp = 2.0; }
          if (sensor.type === 'Pressure') { baseVal = 48.5; noiseAmp = 1.0; }
        }

        // Add small sinusoidal curve + random noise
        const sineShift = Math.sin((steps - i) / 10);
        const noise = (Math.random() - 0.5) * noiseAmp;
        let val = baseVal + sineShift * (baseVal * 0.01) + noise;

        let quality = 'GOOD';
        if (sensor.name === 'West Bay pH Monitor') quality = 'POOR';
        else if (sensor.name === 'North Chlorine Analyzer') quality = 'FAIR';

        readings.push({
          sensorId: sensor._id,
          plantId: sensor.plantId,
          parameter: sensor.type,
          value: parseFloat(val.toFixed(2)),
          quality,
          timestamp
        });
      });
    }

    await SensorReading.insertMany(readings);

    console.log('Creating Initial Demo Alerts...');
    const westBaySensor = sensors.find(s => s.name === 'West Bay pH Monitor');
    const northChlorineSensor = sensors.find(s => s.name === 'North Chlorine Analyzer');

    await Alert.create([
      {
        plantId: plant2._id,
        equipmentId: equipmentList[7]._id,
        severity: 'CRITICAL',
        type: 'EQUIPMENT_HEALTH',
        message: 'Backwash Air Blower 2 vibration level exceeded threshold (5.2 mm/s) & temp high (84.5°C). Prototype Health Score: 35%.',
        status: 'NEW',
        timestamp: new Date(now - 45 * 60 * 1000)
      },
      {
        plantId: plant1._id,
        equipmentId: equipmentList[3]._id,
        severity: 'WARNING',
        type: 'EQUIPMENT_HEALTH',
        message: 'Clearwell Booster Pump 3 exhibits elevated vibration (3.1 mm/s). Maintenance recommended.',
        status: 'NEW',
        timestamp: new Date(now - 30 * 60 * 1000)
      },
      {
        plantId: plant3._id,
        sensorId: westBaySensor._id,
        severity: 'CRITICAL',
        type: 'ANOMALY_DETECTION',
        message: 'West Bay pH Monitor: pH level exceeded 9.35 (Above critical maximum 8.5)',
        status: 'NEW',
        timestamp: new Date(now - 25 * 60 * 1000)
      },
      {
        plantId: plant2._id,
        sensorId: northChlorineSensor._id,
        severity: 'WARNING',
        type: 'ANOMALY_DETECTION',
        message: 'North Chlorine Analyzer: Chlorine is approaching lower warning boundary (0.82 mg/L)',
        status: 'NEW',
        timestamp: new Date(now - 15 * 60 * 1000)
      }
    ]);

    console.log('Creating Chemical Dose Records...');
    await ChemicalDose.create([
      {
        plantId: plant1._id,
        chemical: 'Chlorine',
        currentValue: 1.65,
        recommendedDose: 1.85,
        approvedDose: 1.85,
        confidence: 96,
        reason: 'Maintain optimal residual chlorine disinfectant concentration (1.65 mg/L baseline).',
        status: 'APPROVED',
        createdBy: operatorUser._id,
        approvedBy: operatorUser._id,
        timestamp: new Date(now - 3 * 3600 * 1000)
      },
      {
        plantId: plant1._id,
        chemical: 'Chlorine',
        currentValue: 1.60,
        recommendedDose: 1.80,
        approvedDose: 1.80,
        confidence: 94,
        reason: 'Optimal chlorine residual target maintained in clearwell discharge.',
        status: 'APPROVED',
        createdBy: operatorUser._id,
        approvedBy: operatorUser._id,
        timestamp: new Date(now - 1 * 3600 * 1000)
      }
    ]);

    console.log('Creating Digital Twin Simulations History...');
    await DigitalTwinSimulation.create([
      {
        plantId: plant1._id,
        inputParameters: { pH: 7.35, turbidity: 1.35, chlorine: 1.65, flow: 125, pressure: 48.5 },
        chemicalDose: 1.85,
        predictedOutput: {
          predictedTurbidity: 0.45,
          predictedChlorine: 1.85,
          predictedPH: 7.30,
          waterQualityScore: 95,
          feedback: 'Optimal Dose: Predicted water quality score reaches 95/100.'
        },
        waterQualityScore: 95,
        recommendation: 'Optimal Dose: High disinfectant stability and clean effluent quality.',
        createdBy: operatorUser._id,
        timestamp: new Date(now - 2 * 3600 * 1000)
      }
    ]);

    console.log('Creating Initial Audit Logs...');
    await AuditLog.create([
      {
        userId: adminUser._id,
        action: 'SYSTEM_INITIALIZED',
        entityType: 'System',
        entityId: '001',
        details: 'Initial system setup and demo seed completed',
        ipAddress: '127.0.0.1',
        timestamp: new Date(now - 24 * 3600 * 1000)
      },
      {
        userId: operatorUser._id,
        action: 'DOSE_APPROVED',
        entityType: 'ChemicalDose',
        entityId: '002',
        details: 'Approved Chlorine dose of 1.85 mg/L based on AI recommendation',
        ipAddress: '127.0.0.1',
        timestamp: new Date(now - 3 * 3600 * 1000)
      }
    ]);

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Demo Credentials:');
    console.log('  Admin:    admin@example.com    / password123');
    console.log('  Operator: operator@example.com / password123');
    console.log('  Auditor:  auditor@example.com  / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding Failed:', err);
    process.exit(1);
  }
};

seedDB();
