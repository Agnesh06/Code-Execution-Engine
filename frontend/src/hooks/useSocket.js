import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('leaderboard:update', (data) => {
      if (Array.isArray(data)) {
        setLeaderboard(data);
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return { socket, leaderboard, isConnected, setLeaderboard };
}
