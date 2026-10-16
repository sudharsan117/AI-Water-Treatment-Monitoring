require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const mongoose = require('mongoose');
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

// CORS — allow local dev + deployed Vercel frontend (including preview URLs)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ai-water-treatment-monitoring-eta.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Render health checks, curl, Postman)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
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

const getDbStatus = () => {
  const states = ['DISCONNECTED', 'CONNECTED', 'CONNECTING', 'DISCONNECTING'];
  return states[mongoose.connection.readyState] || 'UNKNOWN';
};

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AI-Powered Water Treatment Plant Monitoring & Chemical Optimization System',
    type: 'MERN Prototype Demonstration',
    database: getDbStatus(),
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    database: getDbStatus(),
    timestamp: new Date()
  });
});

// Database connectivity check for API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is currently disconnected. Please verify MONGO_URI in Render environment variables and MongoDB Atlas Network Access (0.0.0.0/0).',
      dbStatus: getDbStatus()
    });
  }
  next();
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
  if (mongoose.connection.readyState !== 1) {
    console.log('⏳ MongoDB not connected yet; auto-seed will run once connected.');
    return;
  }
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('📦 Empty database detected — running auto-seed for demo data...');
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

mongoose.connection.on('connected', async () => {
  console.log('✅ MongoDB connection established.');
  await autoSeedIfEmpty();
});

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
