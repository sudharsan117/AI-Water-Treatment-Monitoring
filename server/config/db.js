const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/water_treatment_db';
    if (!process.env.MONGO_URI) {
      console.warn('⚠️  WARNING: MONGO_URI is not set in environment variables.');
      console.warn('⚠️  Defaulting to local MongoDB: mongodb://127.0.0.1:27017/water_treatment_db');
      console.warn('⚠️  In production (Render), set MONGO_URI to your MongoDB Atlas connection string.');
    }
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 If using MongoDB Atlas:');
    console.error('   1. Ensure MONGO_URI is set in Render Environment Variables.');
    console.error('   2. Ensure Atlas Network Access allows 0.0.0.0/0 (any IP).');
    console.error('   3. Check database user username/password in the connection string.');
  }
};

module.exports = connectDB;

