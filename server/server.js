const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const prisma = require('./lib/prisma');
const logger = require('./lib/logger');

dotenv.config();

// ─── App Setup ──────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

// Allowed origins (restrict in production)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.endsWith('.netlify.app')) return true;
  return false;
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  },
});

// ─── Security Middleware ────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Body Parsing ───────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    }, `${req.method} ${req.originalUrl}`);
  });
  next();
});

// ─── Health Check ───────────────────────────────────────────

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'UniVerse API v2',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ─── API Routes ─────────────────────────────────────────────

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/storefronts', require('./routes/storefrontRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
// UniVerse API router mounted


// ─── 404 Handler ────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found`, code: 'NOT_FOUND' });
});

// ─── Global Error Handler ───────────────────────────────────

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
    method: req.method,
    url: req.originalUrl,
  }, 'Unhandled error');

  res.status(statusCode).json({
    message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── Socket.IO (Real-time Chat) ─────────────────────────────

const onlineUsers = new Map();

io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'Socket connected');

  // Authenticate user via token
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      onlineUsers.set(decoded.id, socket.id);
      logger.info({ userId: decoded.id, socketId: socket.id }, 'Socket authenticated');
    } catch {
      logger.warn({ socketId: socket.id }, 'Socket auth failed');
    }
  });

  // Send message
  socket.on('sendMessage', async ({ receiverId, text, orderId }) => {
    try {
      const senderId = socket.userId;
      if (!senderId || !receiverId || !text?.trim()) return;

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          text: text.trim(),
          orderId: orderId || null,
        },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
      });

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
      }

      // Echo back to sender
      socket.emit('newMessage', message);
    } catch (err) {
      logger.error({ err, socketId: socket.id }, 'Socket message error');
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) onlineUsers.delete(socket.userId);
    logger.info({ socketId: socket.id }, 'Socket disconnected');
  });
});

// ─── Start Server ───────────────────────────────────────────

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, `UniVerse API v2 running on port ${PORT}`);
});