require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./sockets');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

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
