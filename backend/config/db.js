const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async (mongoUri) => {
  if (cached.conn) {
    console.log('MongoDB Using Cached Connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering to fail fast if no connection
      maxPoolSize: 1, // Start with 1 connection for serverless
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch(err => {
      console.error('MongoDB connection error:', err.message);
      // Do not throw here, let the await catch it
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB Cached Connection Failed');
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
