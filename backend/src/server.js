require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./sockets');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // Auto-seed admin user for in-memory DB or first-time setup
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!', 10);
      await User.create({ name: 'Tournament Admin', email: adminEmail, passwordHash, role: 'ADMIN' });
      console.log(`[Seed] Auto-created ADMIN user: ${adminEmail}`);
    }

    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`[Quiz Server] Running on port ${PORT}`);
      console.log(`[Quiz Server] Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Quiz Server] Startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
