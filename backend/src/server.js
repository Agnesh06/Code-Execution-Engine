require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./sockets');
const { seedDatabase } = require('../seed/seed');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required in production. Add it to backend/.env or your deployment environment.');
    }
    await connectDB();
    await seedDatabase();

    const server = http.createServer(app);
    initSocket(server);

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Quiz Server] Error: Port ${PORT} is already in use by another process!`);
        console.error(`To free port ${PORT} in Windows PowerShell, run:`);
        console.error(`Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
      } else {
        console.error('[Quiz Server] Server error:', err.message);
      }
      process.exit(1);
    });

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
