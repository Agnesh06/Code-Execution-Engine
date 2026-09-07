const mongoose = require('mongoose');

let mongod = null;

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/quizplatform';
  
  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to ${uri}`);
  } catch (err) {
    console.warn(`[MongoDB] Warning: Could not connect to external MongoDB at ${uri}. Falling back to in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`[MongoDB] Connected successfully to in-memory fallback MongoDB at ${memUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Fatal: Failed to initialize in-memory fallback MongoDB:', memErr.message);
      throw memErr;
    }
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('[MongoDB] Disconnect error:', err.message);
  }
}

module.exports = { connectDB, disconnectDB };
