const mongoose = require('mongoose');

function redactMongoUri(uri) {
  try {
    const parsed = new URL(uri);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return '[invalid MongoDB URI]';
  }
}

async function connectDB() {
  const uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    throw new Error(
      'MONGO_URI is required. Add your MongoDB Atlas connection string to backend/.env. See backend/.env.example.'
    );
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://.');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
    });
    console.log(`[MongoDB] Connected successfully to ${redactMongoUri(uri)}`);
  } catch (err) {
    throw new Error(
      `Unable to connect to MongoDB at ${redactMongoUri(uri)}: ${err.message}. ` +
      'For Atlas, verify the database user, URL-encoded password, cluster hostname, and Network Access IP allowlist.'
    );
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.error('[MongoDB] Disconnect error:', err.message);
  }
}

module.exports = { connectDB, disconnectDB };
