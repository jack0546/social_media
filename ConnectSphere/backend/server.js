const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const postRoutes = require('./routes/post');
const callRoutes = require('./routes/call');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ConnectSphere API is running', version: '1.0.0' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a chat room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Leave a chat room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('typing', { userId: data.userId, isTyping: data.isTyping });
  });

  // Handle new message
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  // Handle call signaling
  socket.on('call-user', (data) => {
    io.to(data.userToCall).emit('call-made', { signal: data.signalData, from: data.from, name: data.name });
  });

  socket.on('answer-call', (data) => {
    io.to(data.to).emit('call-accepted', { signal: data.signal, from: data.from });
  });

  socket.on('reject-call', (data) => {
    io.to(data.from).emit('call-rejected', { from: data.from });
  });

  socket.on('end-call', (data) => {
    io.to(data.to).emit('call-ended', { from: data.from });
  });

  // WebRTC signaling for video calls
  socket.on('webrtc-offer', (data) => {
    socket.to(data.to).emit('webrtc-offer', { from: socket.id, offer: data.offer });
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(data.to).emit('webrtc-answer', { from: socket.id, answer: data.answer });
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(data.to).emit('webrtc-ice-candidate', { from: socket.id, candidate: data.candidate });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});