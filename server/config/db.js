const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // 1. Try external MONGO_URI if configured and does not contain unresolved placeholders
  if (uri && !uri.includes('<db_password>') && !uri.includes('127.0.0.1:27017')) {
    try {
      console.log('🔄 Attempting connection to configured MongoDB Atlas / URI...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ Connected to external MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`⚠️  External MongoDB connection failed: ${error.message}`);
      console.log('🔄 Engaging automatic in-memory MongoDB fallback engine...');
    }
  }

  // 2. Fallback: Spin up In-Memory MongoDB Server so the demo works seamlessly
  try {
    console.log('🚀 Initializing built-in in-memory MongoDB engine...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'water_treatment_db' }
    });
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ Connected to In-Memory MongoDB engine successfully!`);
    return conn;
  } catch (memError) {
    console.warn(`⚠️  In-memory engine start failed: ${memError.message}`);
    // 3. Last resort: try local standalone mongod
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/water_treatment_db', {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`✅ Connected to local standalone MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (localError) {
      console.error(`❌ All MongoDB connection strategies failed: ${localError.message}`);
    }
  }
};

module.exports = connectDB;


