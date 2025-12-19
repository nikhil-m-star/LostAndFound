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
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch(err => {
      console.error('MongoDB connection error:', err.message);
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
