// import { io, Socket } from 'socket.io-client';

// const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

// let socket: Socket | null = null;

// export const connectSocket = () => {
//   if (socket?.connected) {
//     return socket;
//   }

//   socket = io(SOCKET_URL, {
//     transports: ['websocket'],
    
//   });

//   socket.on('connect', () => {
//     console.log('Socket connected:', socket?.id);
//   });

//   socket.on('disconnect', (reason) => {
//     console.log('Socket disconnected:', reason);
//   });

//   socket.on('connect_error', (error) => {
//     console.log('Socket connection error:', error.message);
//   });

//   return socket;
// };

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };

// export const getSocket = () => socket;



import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

let socket: Socket | null = null;

// Accept an optional token to send to the backend
export const connectSocket = (token?: string) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    // Pass the token in the auth object (standard Socket.IO practice)
    auth: {
      token: token, 
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;