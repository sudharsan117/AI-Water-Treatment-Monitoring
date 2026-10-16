require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startSimulator } = require('./services/sensorSimulator');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const alertRoutes = require('./routes/alertRoutes');
const aiRoutes = require('./routes/aiRoutes');
const digitalTwinRoutes = require('./routes/digitalTwinRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');
const thresholdRoutes = require('./routes/thresholdRoutes');

const app = express();

// CORS — allow local dev + deployed Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Render health checks, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Folder for PDF Reports
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AI-Powered Water Treatment Plant Monitoring & Chemical Optimization System',
    type: 'MERN Prototype Demonstration',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/digital-twin', digitalTwinRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/thresholds', thresholdRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Auto-seed helper — runs seed if DB is empty (fresh Atlas deployment)
const autoSeedIfEmpty = async () => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('📦 Empty database detected — running auto-seed for demo data...');
      // Dynamically import seed logic (without its own mongoose.connect call)
      const seedModule = require('./seed/seedData');
      await seedModule();
      console.log('✅ Auto-seed completed successfully!');
    } else {
      console.log(`✅ Database already has ${count} users — skipping auto-seed.`);
    }
  } catch (err) {
    console.error('⚠️  Auto-seed error (non-fatal):', err.message);
  }
};

// Connect DB & Start Server
connectDB().then(async () => {
  await autoSeedIfEmpty();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    // Start live sensor simulator polling loop every 4 seconds
    startSimulator(4000);
  });
});

module.exports = app;
