const socketIO = require('socket.io');
const { verifyToken } = require('./jwt');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    },
    pingTimeout: 60000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);

    // Join user's personal room
    socket.join(socket.userId);

    // Join a chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userName} joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userName} left chat: ${chatId}`);
    });

    // Send message
    socket.on('send_message', (data) => {
      const { chatId, message } = data;
      
      // Emit to all users in the chat room
      io.to(chatId).emit('receive_message', {
        ...message,
        sender: {
          _id: socket.userId,
          name: socket.userName
        }
      });
    });

    // Typing indicator
    socket.on('typing', (chatId) => {
      socket.to(chatId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        chatId
      });
    });

    // Stop typing indicator
    socket.on('stop_typing', (chatId) => {
      socket.to(chatId).emit('user_stopped_typing', {
        userId: socket.userId,
        chatId
      });
    });

    // Swap request notification
    socket.on('swap_request_sent', (data) => {
      const { recipientId, swapRequest } = data;
      io.to(recipientId).emit('swap_request_notification', swapRequest);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userName}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };