// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const conversationRoutes = require('./routes/conversations');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
// FIX 1: Made CORS more secure by restricting the origin
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Store user ID to socket mapping
  socketHandler.addUser(socket.userId, socket.id);
  
  // Send current online users to the newly connected user
  const onlineUsers = Array.from(socketHandler.userSocketMap.keys());
  socket.emit('onlineUsers', onlineUsers);
  
  // Notify all other users that this user is online
  socket.broadcast.emit('userOnline', socket.userId);
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    socketHandler.removeUser(socket.userId);
    
    // Notify all users that this user is offline
    io.emit('userOffline', socket.userId);
  });
  
  // Handle real-time events
  socketHandler.handleSocketEvents(socket, io);
});

// Connect to MongoDB
// FIX 2: Removed deprecated Mongoose options
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// FIX 3: Removed the duplicate PORT declaration to prevent a crash
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});