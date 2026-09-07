const { Server } = require('socket.io');
const { getLeaderboard } = require('../services/leaderboardService');

let ioInstance = null;

const socketOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: socketOrigins,
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', async (socket) => {
    try {
      const initialLeaderboard = await getLeaderboard();
      socket.emit('leaderboard:update', initialLeaderboard);
    } catch (err) {
      console.error('[Socket] Error sending initial leaderboard:', err.message);
    }

    socket.on('disconnect', () => {
      // client disconnected cleanly
    });
  });

  return ioInstance;
}

async function broadcastLeaderboard() {
  if (!ioInstance) return;
  try {
    const leaderboard = await getLeaderboard();
    ioInstance.emit('leaderboard:update', leaderboard);
  } catch (err) {
    console.error('[Socket] Error broadcasting leaderboard update:', err.message);
  }
}

function getIO() {
  return ioInstance;
}

module.exports = { initSocket, broadcastLeaderboard, getIO };
