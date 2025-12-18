const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.warn('RUNNING WITHOUT DATABASE CONNECTION - Some features will fail');
    // process.exit(1); // Do not crash, allow server to run for debug
  }
};

module.exports = connectDB;
