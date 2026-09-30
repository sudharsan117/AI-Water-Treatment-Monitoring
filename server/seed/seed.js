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
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/water_treatment_db';
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

    console.log('Creating Sensors for Plant 1...');
    const sensorsData = [
      { plantId: plant1._id, name: 'pH Sensor Alpha', type: 'pH', location: 'Clarifier Intake', unit: 'pH', status: 'ONLINE' },
      { plantId: plant1._id, name: 'Turbidity Sensor Beta', type: 'Turbidity', location: 'Post-Flocculation', unit: 'NTU', status: 'ONLINE' },
      { plantId: plant1._id, name: 'Residual Chlorine Sensor', type: 'Chlorine', location: 'Clearwell Outlet', unit: 'mg/L', status: 'ONLINE' },
      { plantId: plant1._id, name: 'Main Inflow Meter', type: 'Flow', location: 'Primary Intake Header', unit: 'GPM', status: 'ONLINE' },
      { plantId: plant1._id, name: 'Distribution Line Pressure', type: 'Pressure', location: 'High Lift Discharge', unit: 'PSI', status: 'ONLINE' },
      
      { plantId: plant2._id, name: 'North Intake pH', type: 'pH', location: 'Reservoir Intake', unit: 'pH', status: 'ONLINE' },
      { plantId: plant2._id, name: 'North Turbidity Meter', type: 'Turbidity', location: 'Filter Gallery', unit: 'NTU', status: 'ONLINE' },
      { plantId: plant2._id, name: 'North Chlorine Analyzer', type: 'Chlorine', location: 'Disinfection Tank', unit: 'mg/L', status: 'ONLINE' },
      { plantId: plant2._id, name: 'North Flow Rate Sensor', type: 'Flow', location: 'Main Pipe A', unit: 'GPM', status: 'ONLINE' },
      { plantId: plant2._id, name: 'North Main Pressure Gauge', type: 'Pressure', location: 'Pump Output', unit: 'PSI', status: 'ONLINE' },

      { plantId: plant3._id, name: 'West Bay pH Monitor', type: 'pH', location: 'Reclamation Feed', unit: 'pH', status: 'ONLINE' },
      { plantId: plant3._id, name: 'West Bay Turbidity Monitor', type: 'Turbidity', location: 'Sand Filter Outlet', unit: 'NTU', status: 'WARNING' }
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

    console.log('Creating Equipment...');
    const equipmentData = [
      { plantId: plant1._id, name: 'Raw Water Intake Pump 101', type: 'Intake Pump', status: 'OPERATIONAL', healthScore: 94, vibration: 0.6, temperature: 46.5, runtimeHours: 2450 },
      { plantId: plant1._id, name: 'High-Speed Flocculation Mixer', type: 'Mixer', status: 'OPERATIONAL', healthScore: 89, vibration: 1.2, temperature: 52.0, runtimeHours: 1890 },
      { plantId: plant1._id, name: 'Primary Chlorine Dosing Pump', type: 'Dosing Pump', status: 'WARNING', healthScore: 72, vibration: 2.8, temperature: 68.4, runtimeHours: 3120 },
      { plantId: plant1._id, name: 'Clearwell Booster Pump 3', type: 'Booster Pump', status: 'CRITICAL', healthScore: 41, vibration: 4.8, temperature: 84.2, runtimeHours: 4890 },
      { plantId: plant1._id, name: 'Rapid Sand Filter Actuator A', type: 'Filter System', status: 'OPERATIONAL', healthScore: 96, vibration: 0.4, temperature: 42.0, runtimeHours: 1100 },
      
      { plantId: plant2._id, name: 'Northside Main Feed Pump', type: 'Intake Pump', status: 'OPERATIONAL', healthScore: 91, vibration: 0.8, temperature: 48.0, runtimeHours: 1540 },
      { plantId: plant2._id, name: 'Coagulant Metering Unit', type: 'Dosing Unit', status: 'OPERATIONAL', healthScore: 88, vibration: 1.1, temperature: 49.5, runtimeHours: 980 },
      { plantId: plant2._id, name: 'Backwash Air Blower 2', type: 'Blower', status: 'WARNING', healthScore: 68, vibration: 3.2, temperature: 74.0, runtimeHours: 2780 }
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
        let baseVal = 7.2;
        if (sensor.type === 'Turbidity') baseVal = 1.6;
        if (sensor.type === 'Chlorine') baseVal = 1.4;
        if (sensor.type === 'Flow') baseVal = 120;
        if (sensor.type === 'Pressure') baseVal = 48;

        // Add pseudo sinusoidal curve + random noise
        const sineShift = Math.sin((steps - i) / 10);
        const noise = (Math.random() - 0.5) * 0.3;
        let val = baseVal + sineShift * (baseVal * 0.05) + noise;

        // Add anomaly spike at t-10 steps
        if (i === 10 && sensor.type === 'Chlorine') val = 0.4;
        if (i === 8 && sensor.type === 'Turbidity') val = 4.2;

        if (sensor.type === 'pH') val = Math.max(6.0, Math.min(9.0, val));
        if (sensor.type === 'Turbidity') val = Math.max(0.3, Math.min(8.0, val));
        if (sensor.type === 'Chlorine') val = Math.max(0.2, Math.min(3.5, val));
        if (sensor.type === 'Flow') val = Math.max(40, Math.min(180, val));
        if (sensor.type === 'Pressure') val = Math.max(20, Math.min(80, val));

        readings.push({
          sensorId: sensor._id,
          plantId: sensor.plantId,
          parameter: sensor.type,
          value: parseFloat(val.toFixed(2)),
          quality: (val < 0.5 || val > 4.0) ? 'POOR' : 'GOOD',
          timestamp
        });
      });
    }

    await SensorReading.insertMany(readings);

    console.log('Creating Initial Alerts...');
    await Alert.create([
      {
        plantId: plant1._id,
        equipmentId: equipmentList[3]._id,
        severity: 'CRITICAL',
        type: 'EQUIPMENT_VIBRATION',
        message: 'Clearwell Booster Pump 3 vibration level exceeded threshold (4.8 mm/s). High overheating risk.',
        status: 'NEW',
        timestamp: new Date(now - 45 * 60 * 1000)
      },
      {
        plantId: plant1._id,
        sensorId: sensors[2]._id,
        severity: 'WARNING',
        type: 'LOW_CHLORINE_RESIDUAL',
        message: 'Residual Chlorine dropped below lower target boundary (0.95 mg/L). AI recommendation updated.',
        status: 'NEW',
        timestamp: new Date(now - 20 * 60 * 1000)
      },
      {
        plantId: plant1._id,
        sensorId: sensors[1]._id,
        severity: 'INFO',
        type: 'TURBIDITY_ELEVATED',
        message: 'Turbidity transient fluctuation detected during backwash cycle (2.4 NTU).',
        status: 'ACKNOWLEDGED',
        acknowledgedBy: operatorUser._id,
        acknowledgedAt: new Date(now - 120 * 60 * 1000),
        timestamp: new Date(now - 150 * 60 * 1000)
      }
    ]);

    console.log('Creating Chemical Dose Records...');
    await ChemicalDose.create([
      {
        plantId: plant1._id,
        chemical: 'Chlorine',
        currentValue: 1.1,
        recommendedDose: 2.1,
        approvedDose: 2.1,
        confidence: 94,
        reason: 'Residual Chlorine is below target (1.1 mg/L). Elevated inflow turbidity requires increased dosage.',
        status: 'APPROVED',
        createdBy: operatorUser._id,
        approvedBy: operatorUser._id,
        timestamp: new Date(now - 3 * 3600 * 1000)
      },
      {
        plantId: plant1._id,
        chemical: 'Chlorine',
        currentValue: 0.9,
        recommendedDose: 2.3,
        approvedDose: 2.0,
        confidence: 91,
        reason: 'Low chlorine residual detected in clearwell discharge.',
        status: 'ADJUSTED',
        createdBy: operatorUser._id,
        approvedBy: operatorUser._id,
        timestamp: new Date(now - 1 * 3600 * 1000)
      }
    ]);

    console.log('Creating Digital Twin Simulations History...');
    await DigitalTwinSimulation.create([
      {
        plantId: plant1._id,
        inputParameters: { pH: 7.2, turbidity: 2.4, chlorine: 1.1, flow: 135, pressure: 46 },
        chemicalDose: 2.1,
        predictedOutput: {
          predictedTurbidity: 1.6,
          predictedChlorine: 1.95,
          predictedPH: 7.15,
          waterQualityScore: 94,
          feedback: 'Optimal Dose: Predicted water quality score improves to 94/100.'
        },
        waterQualityScore: 94,
        recommendation: 'Optimal Dose: Disinfection efficiency improved without excess residual.',
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
        details: 'Approved Chlorine dose of 2.1 mg/L based on AI recommendation',
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
