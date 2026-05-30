import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

// Use proxy from Vite so we don't hit Mixed Content (HTTP vs HTTPS) issues on local network
const SOCKET_URL = '/';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    username: '',
    deviceType: '',
    role: ''
  });

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('sessions_update', (data) => {
      setSessions(data);
    });

    return () => newSocket.close();
  }, []);

  const registerUser = (username, deviceType, role) => {
    setCurrentUser({ username, deviceType, role });
    if (socket) {
      socket.emit('register', { username, deviceType, role });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, sessions, currentUser, registerUser }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
