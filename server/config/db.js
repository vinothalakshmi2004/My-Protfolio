const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to resolve MongoDB SRV records on networks where local ISP/router blocks SRV queries
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS assignment is restricted
}

let memoryServerInstance = null;

/**
 * Connect to MongoDB database
 * Falls back to MongoMemoryServer in development if local MongoDB is not running
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vino_portfolio';

  // Already connected (e.g. dev:memory script seeded first) -> reuse the connection
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    // In development/test mode, fallback to in-memory MongoDB if local daemon is unreachable
    const isLocalUri = mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost');
    if (process.env.NODE_ENV !== 'production' && isLocalUri) {
      console.warn(`[MongoDB] Local daemon not reachable at ${mongoUri}.`);
      console.log('[MongoDB] Launching embedded in-memory MongoDB instance for development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memoryUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`[MongoDB] Connected to embedded MongoDB successfully at ${memoryUri}`);
        return conn;
      } catch (memErr) {
        console.error(`[MongoDB] Failed to initialize embedded MongoDB: ${memErr.message}`);
        throw error;
      }
    }

    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

/**
 * Disconnect and stop memory server if running
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
  } catch (error) {
    console.error(`[MongoDB] Error closing connection: ${error.message}`);
  }
};

module.exports = connectDB;
module.exports.closeDB = closeDB;
