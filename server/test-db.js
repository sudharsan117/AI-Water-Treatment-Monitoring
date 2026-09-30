require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB Atlas successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE:', err.message);
    process.exit(1);
  });
