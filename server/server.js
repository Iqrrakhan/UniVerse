const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/db');
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: "Welcome to UniVerse API" });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/store', require('./routes/storeRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

app.use((err, req, res, next) => {
  console.log('GLOBAL ERROR:', err);
  res.status(500).json({ message: err.message });
});

// Socket.io
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authenticate user via token
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      onlineUsers.set(decoded.id, socket.id);
      console.log('Authenticated:', decoded.id);
    } catch (err) {
      console.log('Socket auth failed');
    }
  });

  // Send message
  socket.on('sendMessage', async ({ receiverId, text }) => {
    try {
      const senderId = socket.userId;
      if (!senderId) return;

      const conversationId = [senderId, receiverId].sort().join('_');

      const message = await Message.create({
        conversationId,
        sender: senderId,
        receiver: receiverId,
        text
      });

      const populated = await message.populate('sender', 'name');

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', populated);
      }

      // Send back to sender
      socket.emit('newMessage', populated);
    } catch (err) {
      console.log('Message error:', err);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) onlineUsers.delete(socket.userId);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`UniVerse Server orbiting on port ${PORT}`));